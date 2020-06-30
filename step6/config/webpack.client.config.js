const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const webpack = require('webpack')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(base, {
  entry: './src/entry-client.js',
  output: {
    filename: 'client-bundle.js'
  },
  plugins: [
    // 此插件在输出目录中
    // 生成 `vue-ssr-client-manifest.json`。
    new VueSSRClientPlugin()
  ]
})
