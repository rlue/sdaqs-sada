const path = require('path')
const PnpWebpackPlugin = require('pnp-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './assets/index.jsx',
  module: {
    rules: [
      { test: /\.svg$/, use: 'svg-inline-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.jsx?$/, use: 'babel-loader' },
    ],
  },
  output: {
    path: path.resolve('public', 'assets'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  devServer: {
    writeToDisk: true,
  },
}
