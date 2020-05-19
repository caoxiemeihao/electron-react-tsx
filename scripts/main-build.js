/**
 * 主进程打包脚本
 */
const chokidar = require('chokidar');
const wait_on = require('wait-on');
const server = require('electron-connect').server;
require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const ora = require('ora');
const chalk = require('chalk');
const webpack = require('webpack');
const configFactory = require('../config/webpack.main');

const TAG = 'scripts/main-pack.js';
const electron = server.create({
  // port: 9944, // 这个随便用，默认 30080
  stopOnClose: true, // 当关闭最后一个窗口时，退出 electron 程
});
const spinner = ora('Electron webpack build...');
const compiler = webpack(configFactory(argv.env));
let watching = null;

compiler.hooks.afterCompile.tap('electron compiled', () => {
  spinner.stop();
  if (argv.watch) { // 开发模式
    // init-未启动、started-第一次启动、restarted-重新启动
    const state = electron.electronState;
    'init' === state ? electron.start() : electron.restart();
  }
});

compiler.hooks.beforeCompile.tap('electron start compile', () => {
  spinner.start();
});

function compile_handle(err, stats) {
  if (err) {
    // err 对象将只包含与webpack相关的问题，例如错误配置等
    console.log(TAG, chalk.red('💥 Electron webpack 相关报错'));
    console.log(err);

    // 关闭 wepback 监听
    watching && watching.close(() => console.log(TAG, 'Watching Ended.'));
    process.exit(1);
  } else if (stats.hasErrors()) {
    // webpack 编译报错
    const json = stats.toJson('errors-only');
    console.log(TAG, json.errors.join('\n'));
    console.log(TAG, chalk.red('💥 Electron 构建报错'));
  } else {
    console.log(TAG, chalk.green('Electron webpack 构建完成'));
  }
}

if (argv.watch) { // 开发模式
  const opts = {
    resources: [`http://localhost:${argv.port || process.env.PORT}`], // dotenv[PORT === port]
    interval: 900, // poll interval in ms, default 250ms
    log: false,
    verbose: false,
  };

  // 等待 webpack-dev-server 启动后启动 electron
  wait_on(opts, function (err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    // once here, all resources are available
    watching = compiler.watch({
      ignored: /bundle\.js(\.map)?/,
    }, compile_handle);
  });
} else { // 构建模式
  compiler.run(compile_handle);
}
