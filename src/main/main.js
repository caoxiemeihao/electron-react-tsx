/**
 * 主进程入口文件
 */
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
require('dotenv').config();

let win = null;

function createw_indow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const URL = isDev
    ? `http://localhost:${process.env.PORT}`
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(URL);
}

// 切换 DevTools
function toggleDevTools(bool) {
  if (win) {
    if (bool !== undefined) {
      bool
        ? win.webContents.openDevTools()
        : win.webContents.closeDevTools();
    } else {
      win.webContents.toggleDevTools();
    }
  }
}


ipcMain.on('toggle-devtools', (event, bool) => toggleDevTools(bool));

app.whenReady().then(createw_indow);
