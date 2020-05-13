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
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
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
