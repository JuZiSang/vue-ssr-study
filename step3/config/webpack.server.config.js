const merge = require('webpack-merge')
const base = require('./webpack.base.config')

module.exports = merge(base, {
  target: 'node',
  entry: './src/entry-server.js',
  // 因为 nodejs 中只能用 require，所以打包输出采用 commonjs 规范
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default'
  }
})