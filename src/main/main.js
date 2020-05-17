/**
 * 主进程入口文件
 */
const path = require('path');
const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
require('dotenv').config();

function createw_indow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const URL = isDev
    ? `http://localhost:${process.env.port}`
    : `file://${(path.join(__dirname, '../dist'))}/index.html`

  win.loadURL(URL);
}

app.whenReady().then(createw_indow);
