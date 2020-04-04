import Styled, {createGlobalStyle} from 'styled-components'
import { theme } from '../../theme'

export const Layout = Styled.div.attrs({
  className: 'theme-layout'
})`
  width: 100%;
  min-width: 100%;
  background: ${theme.layout.background};
`

export const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,900&display=swap');

/* latin */

.ri-mail-send-fill,
.ri-mail-send-line {
  color: #ffb605 !important;
}

.ri-netease-cloud-music-fill,
.ri-netease-cloud-music-line {
  color: #e84531 !important;
}

.ri-wechat-fill,
.ri-wechat-line {
  color: #19a218 !important;
}

.ri-telegram-fill,
.ri-telegram-line {
  color: #007dc5 !important;
}

.ri-github-fill,
.ri-github-line {
  color: #000 !important;
}

.ri-sun-fill,
.ri-sun-line {
  color: #ffb605 !important;
}

.ri-contrast-fill,
.ri-contrast-line {
  color: #6ac126 !important;
}

.ri-sun-fill,
.ri-sun-line,
.ri-contrast-fill,
.ri-contrast-line {
  position: relative;
  padding: 8px;
  /* right: -8px; */
}

/* latin */

@font-face {
  font-family: 'Heebo';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Heebo Light'), local('Heebo-Light'),
    url(https://fonts.gstatic.com/s/heebo/v5/NGS3v5_NC0k9P9ldb6RMkK4q06VE.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

/* latin */

@font-face {
  font-family: 'Heebo';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Heebo Medium'), local('Heebo-Medium'),
    url(https://fonts.gstatic.com/s/heebo/v5/NGS3v5_NC0k9P9kFbqRMkK4q06VE.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

/* latin */

@font-face {
  font-family: 'Heebo';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Heebo Bold'), local('Heebo-Bold'),
    url(https://fonts.gstatic.com/s/heebo/v5/NGS3v5_NC0k9P9lNaKRMkK4q06VE.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

::selection {
  color: #ffffff;
  background-color: rgb(15, 122, 216);
}

html,
body {
  font-size: 14px;
  line-height: 1.6;
  font-family: 'Heebo', 'PingFang SC', 'Hiragino Sans GB', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji';
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

html,
body,
h1,
h2,
h3,
h4,
h5,
h6,
ul,
p {
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
}

body {
  overflow-x: hidden;
}

::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

/* ::-webkit-scrollbar-thumb {
  border-radius: 5px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(32, 201, 151, 0.7);
} */

`
