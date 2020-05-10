const path = require('path');

const resolve = dir => path.join(__dirname, dir);

module.exports = function (env) {
  const isDev = env === 'development';

  return {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-cheap-source-map' : 'cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              // presets 是 plugins 的集合,把很多需要转换的ES6的语法插件集合在一起，避免各种配置
              // presets 加载顺序和一般理解不一样 ，是倒序的
              presets: [
                [
                  "@babel/preset-env",
                  {
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
                    "debug": isDev,
                  }
                ],
                "@babel/preset-react",
                "@babel/preset-typescript"
              ],
              // plugins 加载顺序是正序的
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-object-rest-spread",
              ],
              cacheDirectory: true,
            },
          }
        }
      ],
    },
    resolve: {
      alias: {
        '@root': resolve('..'),
      },
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    },
  };
};
