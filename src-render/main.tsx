/**
 * render 进程入口文件
 */
import React from 'react'
import ReactDom from 'react-dom'
import App from './page/app'

ReactDom.hydrate(<App />, document.getElementById('root'))
