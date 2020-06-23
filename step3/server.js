const express = require('express')
const path = require('path')
const app = express()
const createApp = require('./dist/server-bundle')

app.use('/static', express.static(path.join('./dist')))

const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync(path.join(__dirname, './public/template.html'), 'utf-8')
})

const content = {
  title: '这是一个 HTML 模板',
  meta: `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      `
}

app.get('*', (req, res) => {
  renderer.renderToString(createApp(), content, (err, html) => {
    res.end(html)
  })
})

app.listen(8880, () => {
  console.log('start http://localhost:8880/')
})