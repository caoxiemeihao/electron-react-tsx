/**
 * 主进程入口文件
 */
const path = require('path');
const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const URL = false
    ? `http://loccalhost:${process.env.port}`
    : `file://${(path.join(__dirname, '../dist'))}/index.html`

  win.loadURL(URL);
}

app.whenReady().then(createWindow);
