const chokidar = require('chokidar');
const wait_on = require('wait-on');
const electron = require('electron-connect').server.create();
require('dotenv').config();

function restart() {
  console.log('==== restart ====');
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
  resources: [`http://localhost:${process.env.port}`], // PORT === port
  interval: 900, // poll interval in ms, default 250ms
  log: false, // wait until bundle finished: /
};

wait_on(opts, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  start();
});
