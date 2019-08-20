'use strict';

// spell-checker:ignore chunkhash devtool

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const PKG = require('./package.json');

// ToDO: generate 'library' from PKG.name instead of using PKG.browserModuleName (and get rid of that property)

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
      sourceMap: true,
      terserOptions: {
        output: { ascii_only: true } // ref: <https://stackoverflow.com/a/57362733/43774>
      }
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
  performance: {
    hints: false
  },
  plugins: [
    new webpack.BannerPlugin({
      banner:
        // `${PKG.name} (as ${PKG.browserModuleName}) ${PKG.version} ([hash]) ${PKG.homepage} @license ${PKG.license}`
        `${PKG.name} (as ${PKG.browserModuleName}) ${PKG.version} ${PKG.homepage} @license ${PKG.license}`
    })
  ]
};
