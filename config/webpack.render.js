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
    target: 'electron-renderer',
    entry: resolve('../src/render/main.tsx'),
    output: {
      path: resolve('../src/dist'),
      filename: isDev ? 'bundle.js' : 'bundle.[hash:9].js',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            // presets 是 plugins 的集合,把很多需要转换的ES6的语法插件集合在一起，避免各种配置
            // presets 加载顺序和一般理解不一样 ，是倒序的
            presets: [
              ["@babel/preset-env", {
                // targets 用来指定 是转换 需要支持哪些浏览器的的支持,这个语法是参照 browserslist,
                // 如果设置 browserslist 可以不设置 target
                "targets": "> 0.25%, not dead",
                // 这个是非常重要的一个属性，主要是用来配合@babel/polyfill ，
                // 这里简单讲下，在 transform-runtime 和 polyfill 差别的环节重点讲, 
                // 有 false,entry,usage,默认是 false 啥子也不干，
                // 为 entry，项目中 main.js 主动引入 @babel/polyfill , 会把所有的 polyfill 都引入，
                // 为 usage main.js 主动引入 @babel/polyfill, 只会把用到的 polyfill 引入，
                "useBuiltIns": "usage",
                "corejs": 3,
                // 默认是 false 开启后控制台会看到 哪些语法做了转换，Babel的日志信息，开发的时候强烈建议开启
                // "debug": isDev,
              }
              ],
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
            // plugins 加载顺序是正序的
            plugins: [
              // "@babel/plugin-syntax-dynamic-import",       // preset-env 中已经集成
              // "@babel/plugin-proposal-object-rest-spread", // preset-env 中已经集成
              "@babel/plugin-transform-runtime",
              ["@babel/plugin-proposal-class-properties", { "loose": true }],
              ["import", {
                "libraryName": "antd",
                "style": true, // or 'css'
              }],
            ],
            cacheDirectory: true,
          },
        },
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
        '@render': resolve('../src/render'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve('../src/render/index.html')
      }),
      new CopyWebpackPlugin([
        // { from: resolve('../src/render/index.html'), to: resolve('../src/dist'), },
        { from: resolve('../src/render/static'), to: resolve('../src/dist/static'), },
      ]),
      ...(isDev
        ? [
          // This is necessary to emit hot updates (currently CSS only):
          new webpack.HotModuleReplacementPlugin(),
        ]
        : [
          new CleanWebpackPlugin(),
        ]),
    ],
    devServer: {
      // port: 4100, 放在 .env 中设置
      // 请注意，当前只有对CSS的更改是热重加载的。JS更改将刷新浏览器。
      hot: true,
      contentBase: resolve('../src/dist'), // 静态文件服务器地址
      stats: 'minimal', // 'none' | 'errors-only' | 'minimal' | 'normal' | 'verbose' object
      // stats: { // log 信息控制
      //   assets: false, // 能关闭静态文件搬运的 log
      //   children: false, // 能关闭 mini-css-extract-plugin log
      // },
    },
  });
};
