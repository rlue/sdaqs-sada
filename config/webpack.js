const path = require('path')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
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
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.js'),
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
    new AssetsPlugin({
      path: path.resolve('assets'),
      removeFullPathAutoPrefix: true,
    }),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['*.js'] }),
    new webpack.DefinePlugin({
      MAPBOXGL_ACCESS_TOKEN: JSON.stringify(process.env.MAPBOXGL_ACCESS_TOKEN),
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
  },
}
