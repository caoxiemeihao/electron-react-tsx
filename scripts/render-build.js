/**
 * 渲染进程构建脚本
 */
process.env.NODE_ENV = 'production';

const path = require('path');
const webpack = require('webpack');
const chalk = require('chalk');
const ora = require('ora');
const configFactory = require('../config/webpack.render');

const config = configFactory(process.env.NODE_ENV);
const compiler = webpack(config);
const spinner = ora('React webpack 构建...');
const TAG = '[scripts/render-build.js]';

compiler.hooks.beforeCompile.tap('start', () => spinner.start());

compiler.run(compileHandle);

function compileHandle(err, stats) {
  // 20-02-25 构建日志控制，还木搞定 = =
  // console.log(stats.compilation.records);
  spinner.stop();

  if (err) {
    // err 对象将只包含与webpack相关的问题，例如错误配置等
    console.log(TAG, chalk.red('💥 webpack 相关报错'));
  } else if (stats.hasErrors()) {
    // webpack 编译报错
    const json = stats.toJson('errors-only');
    // fs.writeFileSync(path.join(__dirname, './\.tmp/errors.json'), JSON.stringify(json, null, 2));
    console.log(TAG, filterLogs(json.errors)().join('\n'));
    console.log(TAG, chalk.red('💥 编译报错'));
  } else {
    console.log(TAG, chalk.green('React webpack 构建成功'));
  }
}

/**
 * webpack 日志过滤
 */
function filterLogs(errors) {
  let tmp = [];
  return function (filter = true) {
    if (filter) {
      errors.forEach(err => {
        if (err.includes('Error: Child compilation failed:')) {
          // 忽略 webpack 内部调用错误栈
          return;
        }
        if (!tmp.find(_ => _.split('\n')[1] === err.split('\n')[1])) {
          // 一个错误，可能会被爆出多次，做下报错去重
          // 比如一个 loader 报错，那么 n 个文件经过 loader 就会报出 n 个错误
          tmp.push(err);
        }
      });
    } else {
      tmp = errors;
    }
    return tmp;
  }
}
