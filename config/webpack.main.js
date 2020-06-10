const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');

const resolve = dir => path.join(__dirname, dir);

module.exports = function (env) {
  const isDev = env === 'development';

  return merge(baseConfig(env), {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? undefined : 'cheap-module-source-map',
    target: 'electron-main',
    entry: resolve('../src/main/main.js'),
    output: {
      path: resolve('../src/main'),
      filename: 'bundle.js',
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|ts)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-typescript"],
            plugins: [
              ["@babel/plugin-proposal-class-properties", { "loose": true }],
            ],
            cacheDirectory: true,
          },
        }
      ],
    },
    resolve: {
      alias: {
        '@main': resolve('../src/main'),
      },
    },
  });
};
