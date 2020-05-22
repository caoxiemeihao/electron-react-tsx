## Electron、webpack、react、typescript 从零开始搭积木

[完整代码 https://github.com/caoxiemeihao/electron-react-tsx](https://github.com/caoxiemeihao/electron-react-tsx)

- Electron 是一个迷你的 chromium，一个 Electron 应用分为 `主进程(main)` 和 `渲染进程(renderer)`
- 渲染进程就是浏览器窗口，可以使用任何你想用的前端技术构建“桌面的”应用程序
- 本教程基于 `react`、`typescript`、`webpack` 等从零开始一行行的手写代码，实现如下功能：

  1. 在 `react` 中开启 `tsx` 支持
  2. 使用 `webpack-dev-server` 实现渲染进程的热更新
  3. 使用 `electron-connect` 配合 `wepack` 的 `watch` 实现主进程热重启
  4. 使用 `electron-builder` 实现 `windows` 平台的安装包打包

> 注：此教程以 windows 为例

#### 准备材料
- 本着“最小化学习”原则 `dependencies` 只安装最基本包的即可
- 先混个脸熟，用到哪里我们说到哪里

```json
{
  "dependencies": {
    "@ant-design/icons": "^4.1.0",
    "antd": "^4.2.2",
    "core-js": "^3.6.5",
    "react": "^16.13.1",
    "react-dom": "^16.13.1",
    "react-router-dom": "^5.1.2"
  },
  "devDependencies": {
    "@babel/core": "^7.9.6",
    "@babel/plugin-proposal-class-properties": "^7.8.3",
    "@babel/plugin-transform-runtime": "^7.9.6",
    "@babel/preset-env": "^7.9.6",
    "@babel/preset-react": "^7.9.4",
    "@babel/preset-typescript": "^7.9.0",
    "@types/react": "^16.9.34",
    "@types/react-dom": "^16.9.7",
    "@types/react-router-dom": "^5.1.5",
    "babel-loader": "^8.1.0",
    "babel-plugin-import": "^1.13.0",
    "chalk": "^4.0.0",
    "chokidar": "^3.4.0",
    "clean-webpack-plugin": "^3.0.0",
    "concurrently": "^5.2.0",
    "copy-webpack-plugin": "^5.1.1",
    "css-loader": "^3.5.3",
    "dotenv": "^8.2.0",
    "electron": "^9.0.0-beta.24",
    "electron-builder": "^22.6.0",
    "electron-connect": "^0.6.3",
    "electron-is-dev": "^1.2.0",
    "eslint": "^7.0.0",
    "eslint-plugin-react": "^7.19.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "file-loader": "^6.0.0",
    "html-webpack-plugin": "^4.3.0",
    "less": "^3.11.1",
    "less-loader": "^6.1.0",
    "minimist": "^1.2.5",
    "ora": "^4.0.4",
    "style-loader": "^1.2.1",
    "wait-on": "^5.0.0",
    "webpack": "^4.43.0",
    "webpack-dev-server": "^3.11.0",
    "webpack-merge": "^4.2.2"
  }
}
```

#### 大体目录结构
- 本教程主要介绍构建脚本部分，react、router、antd 基础代码部分略

```tree
.
├─config/
│  ├─webpack.config.js    # 基本 webpack 配置
│  ├─webpack.main.js      # electron 主进程配置
│  └─webpack.render.js    # electron 渲染进程配置(react、tsx)
│
├─dist/                   # React 打包后的文件
├─eslint-rules/
├─node_modules/
├─script/
│  ├─render-build.js      # React 打包脚本
│  ├─render-start.js      # React 开发脚本
│  ├─main-pack.js         # Electron electron-builder
│  └─main-build.js        # Electron 打包脚本
│
├─src-main/               # Electron 主进程目录
│  ├─main.js              # Electron 开发入口
│  └─bundle.js            # Electron 运行入口
│
├─src-render/             # Electron 渲染进程目录
│  │
│  ├─static/              # **** 静态文件夹，直接搬运到 dist/static
│  │                      # **** 在样式文件里面用法：background: url(./static/image/xxx.png)
│  │
│  └─main.tsx             # React 入口文件
```

#### 编写 webpack 配置

> 渲染进程、主进程都需要 webpack 打包

渲染进程使用 react、tsx 编写，所以需要编译才能运行

###### 为什么 Electron 的主进程需要 webpack 打包？
  - 首先，不用 webpack 打包 **也能用**
  - 打包目的是优化 `electron` 打包包体大小
  - `electron` 运行时候依赖 `node_modules` 中的模块
    * 那么问题来了打包时候如何确定 `node_modules` 中哪些模块是有用的？😱
    * 就算你都一个个挑出来了，`人才` 变成 `人力` 你开心了？🙃
    * 索性用 webpack 去 `node_modules` 里面 **掏出有用的** 模块😁
  - 还有一个附带的好处，就是可以压缩代码，防止破解


###### 根目录新建 `config` 文件夹，新建如下三个文件
  * `config/webpack.config.js` 主进程、渲染进程通用的配置
  * `config/webpack.main.js` 主进程配置
  * `config/webpack.render.js` 渲染进程(react)配置

- 所有的 `webapck` 配置文件都以 `function` 的形式导出，方便我们传入 `env` 环境

###### webpack.config.js (主进程主、渲染进程公用部分)
- mode 代码是否需要压缩
- devtool 将生成打包后代码的 source-map 方便调试，不同的 source-map 的生成方式生成速度不一样，生成后的体积不一样
- node 默认情况下，webpack 会将 node 环境下一些全局变量做填充，因为前端木有这些东西。在 electron 中渲染进程和主进程都是提供全量的 NODE API，所以不需要 `webpack 垫片`
- resolve.alias 代表引入文件的“捷径”
- resolve.extensions 代表引入文件可以不带扩展名

  ```js
  const path = require('path');

  const resolve = dir => path.join(__dirname, dir);

  module.exports = function (env) {
    const isDev = env === 'development';

    return {
      mode: isDev ? 'development' : 'production',
      devtool: isDev ? 'eval-cheap-source-map' : 'cheap-module-source-map',
      module: {
        // makes missing exports an error instead of warning
        strictExportPresence: true,
        rules: [],
      },
      node: {
        // 不提供任何 polyfill
        global: false,
        __filename: false,
        __dirname: false,
      },
      resolve: {
        alias: {
          '@root': resolve('..'),
        },
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      },
    };
  };
  ```

###### webpack.main.js

- 先引入 `webpack-merge` 将公用的配置合并进来
- 主进程中我我们也开启了 `typescript` 支持，如果你想用的话
- target 选项根据 webpack 官方说明配置 **electron-main** 代表主进程
  ##### webpack 打包各个宿主环境下的 js 就是通过 target 来指定的
- entry 主进程入口文件
- output 主进程打包后文件出口

  ```js
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
  ```

###### webpack.render.js
- 渲染进程可以使用所有的 `Node.js API`
- 我们把 `target` **electron-renderer**，这也是有别与浏览器环境下开发的唯一区别
- 将 `babel` 的所有配置放在了 `babel-loader` 中，方便和主进程区分
- CleanWebpackPlugin 自动清理 `dist` 文件夹里面的所有文件，因为如果设置了 output 得文件带 hash 尾缀的话，文件会越来越多。所以每次构建时候自动清理下 dist 下过时的文件
- HtmlWebpackPlugin 将打包后的 `js`、`style` 插入到 index.html 中
- CopyWebpackPlugin 搬运一些静态文件到 dist 下
- `lessRegex`、`lessModuleRegex` 配置技巧，结合 `css-loader` 提供的“命名空间”
  * `.less` 文件使用方法
    ```jsx
    import './index.less' // 直接引入
    ```
  * `.less.mod.less`、`.less.module.less` 文件使用方法
    ```jsx
    import styles from './index.module.less' // 使用命名空间
    <div className={styles.class}></div>
    ```


  ```js
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
          { from: resolve('../src/render/index.html'), to: resolve('../src/dist'), },
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
      },
    });
  };
  ```

以上就是所有的 `webpack` 配置了

#### 编写启动、构建脚本
- 到这里细心的小伙伴已经发现了，我们的 package.json 中并没有 **webpack-cli**
- 接下来开始通过脚本控制 **webpack、webpack-dev-server** 😊

###### 根目录新建 `scripts` 文件夹，新建如下三个文件
  * `scripts/main-build.js` 主进程构建、启动脚本
  * `scripts/render-start.js` 渲染进程(react)启动(webpack-dev-server)
  * `scripts/render-build.js` 渲染进程(react)打包

###### scripts/main-build.js
- `chokidar` 是 node.js 中 fs 模块监听文件的“包装”，比原生更加好用，gulp、webpack 内部的文件监听也是基于 `chokidar`
  * 发音：“樵基达尔” 🙃
  * 这里我们用了 webpack.watch，`chokidar` 只做介绍，不直接使用
- `wait-on` 提供了一些“等待”，这里我们用作“等待webpack-dev-server 启动后启动 `electron`
- `electron-connect` 不要被名字误导，这个库提供了“主进程”启动、重启，“渲染进程”重新加载的功能
  * 我们的“主进程热重启”就是用 webpack 的钩子配合 electron-connect 提供的 restart 实现的
- `dotenv` 解析根目录下的 .env 文件
- `minimist` 解析命令行参数如 scripts 下的一个常见命令：
  ```bash
  webpack-dev-server --config=config/webpack.render.js --progress
  ```
- `ora` 命令行 loading 动画
- `chalk` 控制台输出文字带颜色、带背景色
- `webpack` 核心，wepback 函数接收 webpack.config 并返回 `compiler` 对象，包涵如下两个方法：
  - `run` 根据 wepback 配置编译主进程
  - `watch` 和 `run` 运行方式一样，但是编译后不会停下来，会继续监听文件变化并且重复编译
  - `compiler.hooks.beforeCompile.tap` 编译之前干点啥
  - `compiler.hooks.afterCompile.tap` 编译完成后干点啥

  ```js
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
    stopOnClose: true, // 当关闭最后一个窗口时，退出 electron 程序
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
  ```

###### scripts/render-start.js
- `webpack-dev-server` 啦啦啦，这个脚本就是去掉 **webpack-cli** 的关键咯，这里直接把 webpack.compiler 丢给 `webpack-dev-server` 就好啦，其余的啥都不管哩 (●ˇ∀ˇ●)

  ```js
  /**
   * 渲染进程开发脚本
   */
  process.env.NODE_ENV = 'development';

  const path = require('path');
  const webpack = require('webpack');
  const WebpackDevServer = require('webpack-dev-server');
  const chalk = require('chalk');
  require('dotenv').config();
  const configFactory = require('../config/webpack.render');

  const config = configFactory(process.env.NODE_ENV);
  const serverConfig = config.devServer || {};
  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, serverConfig);
  const port = process.env.PORT || 4000;

  server.listen(port, serverConfig.host || '0.0.0.0', err => {
    if (err) {
      return console.log(err);
    }
    console.log(chalk.green(`编译成功，服务运行在 http://localhost:${port}`));
  });

  // ctrl+c、kill 命令
  ['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, function () {
      server.close();
      process.exit();
    });
  });
  ```

###### scripts/render-build.js

  ```js
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
  ```

至此所有构建脚本已经写好，下面开始配置 `scripts` 命令

  ```json
  {
    "scripts": {
      "start": "concurrently -n=react,electron -c=blue,green \"npm run dev:react\" \"npm run dev:electron\"",
      "dev:react": "node scripts/render-start",
      "dev:electron": "node scripts/main-build --env=development --watch",
      "build-win": "node scripts/render-build && node scripts/main-build --env=production && electron-builder -w"
    }
  }
  ```
- 启动下试试
  ```bash
  yarn start
  ```
![主窗口](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/main-window.png)

###### electron-builder 构建配置
- 适用于 `windows` 操作系统

  ```json
  {
    "build": {
      "files": [
        "!node_modules",
        "src/main",
        "src/dist"
      ],
      "win": {
        "target": [
          {
            "target": "nsis",
            "arch": [
              "x64",
              "ia32"
            ]
          }
        ],
        "artifactName": "${productName}_setup_${version}.${ext}"
      },
      "directories": {
        "output": "release"
      },
      "extends": null,
      "productName": "caoxie",
      "nsis": {
        "oneClick": false,
        "perMachine": false,
        "allowToChangeInstallationDirectory": true,
        "deleteAppDataOnUninstall": false
      }
    }
  }
  ```

- 打包下试试
  ```bash
  yarn build-win

  yarn run v1.17.3
  $ node scripts/render-build && node scripts/main-build --env=production && electron-builder -w
  [scripts/render-build.js] React webpack 构建成功
  scripts/main-pack.js Electron webpack 构建完成
  (node:11848) ExperimentalWarning: The fs.promises API is experimental
    • electron-builder  version=22.6.0 os=10.0.18362
    • loaded configuration  file=package.json ("build" field)
    • description is missed in the package.json  appPackageFile=D:\github\test-electron\package.json
    • writing effective config  file=release\builder-effective-config.yaml
    • packaging       platform=win32 arch=x64 electron=9.0.0-beta.24 appOutDir=release\win-unpacked
    • default Electron icon is used  reason=application icon is not set
    • packaging       platform=win32 arch=ia32 electron=9.0.0-beta.24 appOutDir=release\win-ia32-unpacked
    • building        target=nsis file=release\caoxie_setup_1.0.0.exe archs=x64, ia32 oneClick=false perMachine=false
    • building block map  blockMapFile=release\caoxie_setup_1.0.0.exe.blockmap
  Done in 61.21s.
  ```
  
![](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/release-folder.png)

- 安装下试试

![](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/setup.png)
![](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/next.png)
![](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/install.png)
![](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/finish.png)

大功告成啦！！！(ง •_•)ง
