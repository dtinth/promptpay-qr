var path = require('path')
var webpack = require('webpack')
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin')

module.exports = {
  entry: {
    index: './browser.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'promptypay-browser.min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new UnminifiedWebpackPlugin()
  ]
}