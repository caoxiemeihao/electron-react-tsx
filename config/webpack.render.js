const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.config');

const resolve = dir => path.join(__dirname, dir);

const lessRegex = /\.less$/;
const lessModuleRegex = /\.(mod|module).less$/;
// antd@4 下报错
// const lessNormalRegex = new RegExp(`(\\.normal\\.less$)|(ode_modules\\${path.sep}antd)`);
const getStyleLoaders = (mod = false) => [
  'style-loader',
  {
    loader: 'css-loader',
    options: {
      modules: mod ? { localIdentName: '[path][name]__[local]' } : undefined,
    }
  },
  {
    loader: 'less-loader',
    options: {
      lessOptions: { javascriptEnabled: true },
    },
  },
];

module.exports = function (env) {
  const isDev = env === 'development';

  return merge(baseConfig(env), {
    entry: resolve('../src-render/main.tsx'),
    output: {
      path: resolve('../dist'),
      filename: isDev ? 'bundle.js' : 'bundle.[hash:9].js',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: lessRegex,
          exclude: lessModuleRegex,
          use: getStyleLoaders(),
        },
        {
          test: lessModuleRegex,
          use: getStyleLoaders(true),
        },
        {
          test: /\.(jpe?g|png|svg|gif)$/,
          loader: 'file-loader',
        },
      ],
    },
    resolve: {
      alias: {
        '@render': resolve('../src-render'),
      },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: resolve('../src-render/index.html')
      }),
      new CopyWebpackPlugin([
        { from: resolve('../src-render/index.html'), to: resolve('../dist'), },
        { from: resolve('../src-render/static'), to: resolve('../dist/static'), },
      ]),
      ...(isDev
        ? []
        : [
          new CleanWebpackPlugin(),
        ]),
    ],
    devServer: {
      port: 4100,
      hot: true,
      contentBase: resolve('../dist'), // 静态文件服务器地址
      stats: 'minimal', // 'none' | 'errors-only' | 'minimal' | 'normal' | 'verbose' object
      // stats: { // log 信息控制
      //   assets: false, // 能关闭静态文件搬运的 log
      //   children: false, // 能关闭 mini-css-extract-plugin log
      // },
    },
  });
};
