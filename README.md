# test-electron

- 此项目是个人为了我一个小伙伴解放工作生产力发起的
  * 可以理解为是一个被大吹特吹的 `Python自动化办公` 的 NodeJs 版 🙃
- 基于个人对 `webpack`、`electron`、`typescript` 的使用经验继续学习
- 喜欢的小伙伴可以拿去修修改改、用在实际工作中

## 技术栈
- `electron`、`react`、`typescript`、`antd`、`mobx`

## 为什么 Electron 的主进程需要 webpack 打包？
- 首先，不用 webpack 打包 **也能用**
- 打包目的是优化 `electron` 打包包体大小
- `electron` 运行时候依赖 `node_modules` 中的模块
  * 那么问题来了打包时候如何确定 `node_modules` 中哪些模块是有用的？😱
  * 就算你都一个个挑出来了，`人才` 变成 `人力` 你开心了？🙃
  * 索性用 webpack 去 `node_modules` 里面 **掏出有用的** 模块😁

## 目录结构
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
│
│  ├─render-build.js      # React 打包脚本
│  ├─render-start.js      # React 开发脚本
│  ├─main-build.js        # Electron 打包脚本
│  └─main-start.js        # Electron 开发脚本
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

### 命令
- 启动 `yarn start` or `npm start`
- 打包 `yarn build` or `npm run build`

---

![](https://raw.githubusercontent.com/caoxiemeihao/electron-react-tsx/master/screenshot/main-window.png)
