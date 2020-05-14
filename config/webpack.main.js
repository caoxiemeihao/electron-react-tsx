const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');

const resolve = dir => path.join(__dirname, dir);

module.exports = function (env) {

  return merge(baseConfig(env), {
    target: 'electron-render',
    entry: resolve('../src/main/main.js'),
    output: {
      path: resolve('../src/main'),
      filename: 'bundle.js',
    },
    resolve: {
      alias: {
        '@main': resolve('../src/main'),
      },
    },
  });
};
