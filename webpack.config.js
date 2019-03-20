'use strict';

// spell-checker:ignore chunkhash devtool

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const PKG = require('./package.json');

module.exports = {
  mode: 'development',
  context: __dirname,
  devtool: 'source-map',
  entry: {
    [`${PKG.name}.user`]: path.resolve(__dirname, PKG.main),
    [`${PKG.name}.min.user`]: path.resolve(__dirname, PKG.main),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: PKG.browserModuleName,
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
    minimizer: [ new TerserPlugin({
      include: /[.]min([.]user)?[.]js$/i,
      sourceMap: true
    })]
  },
  module: {
    rules: [
      {
        test: /[.]css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /[.]js$/,
        use: "babel-loader",
        // exclude: /(bower_components|node_modules)/,
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner:
        // `${PKG.name} (as ${PKG.browserModuleName}) ${PKG.version} ([hash]) ${PKG.homepage} @license ${PKG.license}`
        `${PKG.name} (as ${PKG.browserModuleName}) ${PKG.version} ${PKG.homepage} @license ${PKG.license}`
    })
  ]
};
