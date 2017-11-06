/* eslint-env node */
/* eslint indent: ['error', 2] */
const path = require('path')
const resolvePath = filename => path.resolve(__dirname, filename)

module.exports = {
  entry: {
    index: resolvePath('verify-webpack-ts.ts'),
  },
  output: {
    path: resolvePath('dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      { test: /\.ts$/, use: ['ts-loader'] },
    ],
  },
}
