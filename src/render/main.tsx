/**
 * render 进程入口文件
 */
import React from 'react'
import ReactDom from 'react-dom'
import { HashRouter } from 'react-router-dom'
import App from './page/app'

(ReactDom.render || ReactDom.hydrate)(
  <HashRouter>
    <App />
  </HashRouter>
  , document.getElementById('root')
)
