/**
 * 开发启动脚本
 */
process.env.NODE_ENV === 'development';

const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const argv = require('optimist').argv;
const chalk = require('chalk');
const configFactory = require('../config/webpack.render');

const config = configFactory(process.env.NODE_ENV);
const serverConfig = config.devServer || {};
const compiler = webpack(config);
const server = new WebpackDevServer(compiler, serverConfig);
const port = argv.port || 4100;

server.listen(port, serverConfig.host || '0.0.0.0', err => {
  if (err) {
    return console.log(err);
  }
  console.log(chalk.green(`编译成功，服务运行在 http://localhost:${port}`));
});

// ctrl+c、kill 命令
['SIGINT', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    server.close();
    process.exit();
  });
});
