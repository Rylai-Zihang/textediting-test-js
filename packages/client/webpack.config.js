const path = require('path');

const LiveReloadPlugin = require('webpack-livereload-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  },
  plugins: [
    new LiveReloadPlugin()
  ],
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({ configFile: './tsconfig.json'})
    ],
    extensions: [".ts", ".tsx", ".js"]
  }
};