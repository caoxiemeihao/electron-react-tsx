/**
 * 主进程开发脚本
 * 废弃版本
 * 监听重启已通过 webpack compiler.watch 实现
 */
const chokidar = require('chokidar');
const wait_on = require('wait-on');
const server = require('electron-connect').server;
require('dotenv').config();

const electron = server.create({
  port: 30081,
  stopOnClose: true,
});

function restart() {
  electron.restart();
}

function start() {
  const watcher = chokidar.watch('src/main/**/*', {
    ignored: /bundle\.js(\.map)?/,
    persistent: true,
  });

  watcher.on('change', restart);
  // watcher.on('add', restart); 会造成死循环 😥20-05-17

  electron.start();
}

const opts = {
  resources: [`http://localhost:${process.env.PORT}`], // PORT === port
  interval: 900, // poll interval in ms, default 250ms
  log: false, // wait until bundle finished: /
};

// 等待 webpack-dev-server 启动后启动 electron
wait_on(opts, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  start();
});
