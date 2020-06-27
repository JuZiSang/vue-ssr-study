const merge = require('webpack-merge')
const base = require('./webpack.base.config')

module.exports = merge(base, {
  entry: './src/entry-client.js',
  output: {
    filename: 'client-bundle.js'
  }
})
