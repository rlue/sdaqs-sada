const path = require('path')
const PnpWebpackPlugin = require('pnp-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './assets/index.jsx',
  module: {
    rules: [
      { test: /\.svg$/, use: 'svg-inline-loader' },
      { test: /\.jsx?$/, use: 'babel-loader' },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: 'config/',
              },
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.resolve('public', 'assets'),
    filename: '[name]-[contenthash].js',
  },
  plugins: [
    new AssetsPlugin({ path: path.resolve('assets') }),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['*.js'] }),
  ],
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
