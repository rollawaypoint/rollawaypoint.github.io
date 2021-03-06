---
date: 2019-05-21
title: Fetch abort - 使用ts封装一个fetch请求库（拦截器promise链的提前终止）
template: post
thumbnail: '../thumbnails/post.png'
slug: fetch-abort
categories:
  - Encapsulating
tags:
  - promise
  - fetch
---

当你的 promise 链某一个环节需要显式的抛出异常，这个时候后面的所有剩余的 then 回调其实就不必要执行，那么如何终止这个 Promise 链呢

---

Eg.:

```js
/**
 * @main 拦截器入栈
 * @description request前置，response后置
 */
// this.interceptors.request.reducer((fns) => {
//   chain.unshift(fns);
// });

// this.interceptors.response.reducer((fns) => {
//   chain.push(fns);
// });
const chain = [
  ...this.interceptors.request.handlers,
  [dispatchRequest, undefined],
  ...this.interceptors.response.handlers
]

/**
 * @main promise链调用
 */
return chain.reduce(
  (promise, interceptors) => (promise = promise.then(...interceptors)),
  Promise.resolve(options)
)
```

想到这个问题的时候真的是百思不得其解，试图请教交流群的“大佬”，得到的答复全是“既然你使用 promise 那就是一个承诺，现在突然告诉他你的承诺不算话了违背 promise”、“为什么用 reduce”、“用 rxjs 解决一切”，etc...

难受，难道就没有 hack 的方式吗？

正常情况是需要主动抛出异常之后，然后在接下来 promise 所有 catch 回调中都要交进行接收 Error 和抛出 Error（难以忍受这种工作）

```js
doSth()
  .then(value => {
    if (sthErrorOccured()) {
      throw new Error('BIG_ERROR')
    }
    // normal logic
  })
  .catch(reason => {
    if (reason.message === 'BIG_ERROR') {
      throw reason
    }
    // normal logic
  })
  .then()
  .catch(reason => {
    if (reason.message === 'BIG_ERROR') {
      throw reason
    }
    // normal logic
  })
  .then()
  .catch(reason => {
    if (reason.message === 'BIG_ERROR') {
      throw reason
    }
    // normal logic
  })
```

这种方案的问题在于，你需要在每一个 catch 里多写一个 if 来判断这个特殊的 Error，繁琐不说，还增加了耦合度以及重构的困难。

如果有什么办法能直接在发生这种错误后停止后面所有 Promise 链的执行，我们就不需要在每个 catch 里检测这种错误了，只需要编写处理该 catch 块本应处理的错误的代码就可以了。

**有没有办法不在每个 catch 里做这种判断呢？**

办法确实是有的，那就是在发生无法继续的错误后，直接返回一个始终不 resolve 也不 reject 的 Promise，即这个 Promise 永远处于 pending 状态，那么后面的 Promise 链当然也就一直不会执行了，因为会一直等着。类似下面这样的代码

```js
Promise.stop = function() {
  return new Promise(function() {})
}

doSth()
  .then(value => {
    if (sthBigErrorOccured()) {
      return Promise.stop()
    }
    // normal logic
  })
  .catch(reason => {
    // will never get called
    // normal logic
  })
  .then()
  .catch(reason => {
    // will never get called
    // normal logic
  })
  .then()
  .catch(reason => {
    // will never get called
    // normal logic
  })
```

这种方案的好处在于你几乎不需要更改任何现有代码，而且兼容性也非常好，不管你使用的哪个 Promise 库，甚至是不同的 Promise 之间相互调用，都可以达到目的。

然而这个方案有一个不那么明显的缺陷，那就是会造成潜在的内存泄露。

试想，当你把回调函数传给 Promise 的 then 方法后，如果这时 Promise 的状态还没有确定下来，那么 Promise 实例肯定会在内部保留这些回调函数的引用；在一个 robust 的实现中，回调函数在执行完成后，Promise 实例应该会释放掉这些回调函数的引用。如果使用上述方案，那么返回一个永远处于 pending 状态的 Promise 之后的 Promise 链上的所有 Promise 都将处于 pending 状态，这意味着后面所有的回调函数的内存将一直得不到释放。在简单的页面里使用这种方案也许还行得通，但在 WebApp 或者 Node 里，这种方案明显是不可接受的。

**那有没有办法即达到停止后面的链，同时又避免内存泄露呢。**

让我们回到一开始的思路，我们在 Promise 链上所有的 catch 里都加上一句 if，来判断传来的错误是否为一个无法处理的错误，如果是则一直往后面抛，这样就达到了即没有运行后面的逻辑，又避免了内存泄露的问题。

这是一个高度一致的逻辑，我们当然可以把它抽离出来。我们可以实现一个叫 next 的函数，挂在 Promise.prototype 上面，然后在里面判断是否是我们能处理的错误，如果是，则执行回调，如果不是，则一直往下传：

```js
var BIG_ERROR = new Error('BIG_ERROR')

Promise.prototype.next = function(onResolved, onRejected) {
  return this.then(function(value) {
    if (value === BIG_ERROR) {
      return BIG_ERROR
    } else {
      return onResolved(value)
    }
  }, onRejected)
}

doSth()
  .next(function(value) {
    if (sthBigErrorOccured()) {
      return BIG_ERROR
    }
    // normal logic
  })
  .next(value => {
    // will never get called
  })
```

进一步，如果把上面代码中“致命错误”的语义换成“跳过后面所有的 Promise”，我们就可以得到跳过后续 Promise 的方式了：

```js
var STOP_SUBSEQUENT_PROMISE_CHAIN = new Error()

Promise.prototype.next = function(onResolved, onRejected) {
  return this.then(function(value) {
    if (value === STOP_SUBSEQUENT_PROMISE_CHAIN) {
      return STOP_SUBSEQUENT_PROMISE_CHAIN
    } else {
      return onResolved(value)
    }
  }, onRejected)
}

doSth()
  .next(function(value) {
    if (sthBigErrorOccured()) {
      return STOP_SUBSEQUENT_PROMISE_CHAIN
    }
    // normal logic
  })
  .next(value => {
    // will never get called
  })
```

为了更明显的语义，我们可以把“跳过后面所有的 Promise”单独封装成一个 Promise：

```js
var STOP = {}
Promise.stop = function() {
  return Promise.resolve(STOP)
}

Promise.prototype.next = function(onResolved, onRejected) {
  return this.then(function(value) {
    if (value === STOP) {
      return STOP
    } else {
      return onResolved(value)
    }
  }, onRejected)
}

doSth()
  .next(function(value) {
    if (sthBigErrorOccured()) {
      return Promise.stop()
    }
    // normal logic
  })
  .next(value => {
    // will never get called
  })
```

这样就实现了在语义明确的情况下，不造成内存泄露，而且还停止了后面的 Promise 链。

为了对现有代码尽量少做改动，我们甚至可以不用新增 next 方法而是直接重写 then：

```js
;(function() {
  var STOP_VALUE = Symbol() //构造一个Symbol以表达特殊的语义
  var STOPPER_PROMISE = Promise.resolve(STOP_VALUE)

  Promise.prototype._then = Promise.prototype.then

  Promise.stop = function() {
    return STOPPER_PROMISE //不是每次返回一个新的Promise，可以节省内存
  }

  Promise.prototype.then = function(onResolved, onRejected) {
    return this._then(function(value) {
      return value === STOP_VALUE ? STOP_VALUE : onResolved(value)
    }, onRejected)
  }
})()

Promise.resolve(8)
  .then(v => {
    console.log(v)
    return 9
  })
  .then(v => {
    console.log(v)
    return Promise.stop() //较为明确的语义
  })
  .catch(function() {
    // will never called but will be GCed
    console.log('catch')
  })
  .then(function() {
    // will never called but will be GCed
    console.log('then')
  })
```

以上对 then 的重写并不会造成什么问题，闭包里的对象在外界是访问不到，外界也永远也无法构造出一个跟闭包里 Symbol 一样的对象，考虑到我们只需要构造一个外界无法“===”的对象，我们完全可以用一个 Object 来代替：

```js
;(function() {
  var STOP_VALUE = {} //只要外界无法“===”这个对象就可以了
  var STOPPER_PROMISE = Promise.resolve(STOP_VALUE)

  Promise.prototype._then = Promise.prototype.then

  Promise.stop = function() {
    return STOPPER_PROMISE //不是每次返回一个新的Promise，可以节省内存
  }

  Promise.prototype.then = function(onResolved, onRejected) {
    return this._then(function(value) {
      return value === STOP_VALUE ? STOP_VALUE : onResolved(value)
    }, onRejected)
  }
})()

Promise.resolve(8)
  .then(v => {
    console.log(v)
    return 9
  })
  .then(v => {
    console.log(v)
    return Promise.stop() //较为明确的语义
  })
  .catch(function() {
    // will never called but will be GCed
    console.log('catch')
  })
  .then(function() {
    // will never called but will be GCed
    console.log('then')
  })
```

这个方案的另一个好处（好处之一是不会造成内存泄露）是可以让你非常平滑地（甚至是一次性的）从“返回一个永远 pending 的 Promise”过度到这个方案，因为代码及其语义都基本没有变化。在之前，你可以定义一个 Promise.stop()方法来返回一个永远 pending 的 Promise；在之后，Promise.stop()返回一个外界无法得到的值，用以表达“跳过后面所有的 Promise”，然后在我们重写的 then 方法里使用。

这样就解决了停止 Promise 链这样一个让人纠结的问题。

### References

- [从如何停掉 Promise 链说起](https://github.com/xieranmaya/blog/issues/5)
