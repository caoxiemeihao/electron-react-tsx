/**
 * 主进程构建脚本
 * 报错，暂时未搞定 20-05-17
 */
const path = require('path');
const builder = require('electron-builder');
const Platform = builder.Platform

builder.build({
  "files": [
    path.join(__dirname, '../src/main'),
    path.join(__dirname, '../src/dist'),
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
})
  .then((...args) => {
    console.log(args)
  })
  .catch(error => {
    console.log(error);
  });
