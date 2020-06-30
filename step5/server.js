const express = require('express')
const path = require('path')
const app = express()
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

app.use('/static', express.static(path.join('./dist')))

const renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: require('fs').readFileSync(path.join(__dirname, './public/template.html'), 'utf-8'),
  clientManifest
})

app.get('/api/item', (req, res) => {
  res.status(200).json({
    message: 'ok',
    code: 1,
    data: Array.from({ length: 20 }, (item, index) => ({ name: index }))
  })
})

app.get('*', (req, res) => {
  const content = {
    url: req.url,
    title: '这是一个 HTML 模板',
    meta: `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      `
  }
  renderer.renderToString(content, (err, html) => {
    console.error(err)
    if (err) {
      if (err.code === 404) {
        res.status(404).end('Page not found')
      } else {
        res.status(500).end('Internal Server Error')
      }
    } else {
      res.end(html)
    }
  })
})

app.listen(8880, () => {
  console.log('start http://localhost:8880/')
})