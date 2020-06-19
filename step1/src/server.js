const Vue = require('vue')
const express = require('express')
const path = require('path')
const app = express()

/**
 * 简单 Vue To Html
 */
function demo1() {
  const renderer = require('vue-server-renderer').createRenderer()
  app.get('/demo1/*', (req, res) => {
    const vueApp = new Vue({
      data: {
        url: req.url
      },
      template: `<div> 这是一个 SSR 站点 {{url}} </div>`
    })

    renderer.renderToString(vueApp, (err, html) => {
      res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <meta charset="utf-8" />
        <body>${html}</body>
      </html>
    `)
    })
  })
}

/**
 * 使用 Html 模板
 */
function demo2() {
  const renderer = require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync(path.join(__dirname, './template.html'), 'utf-8')
  })

  const content = {
    title: '这是一个 HTML 模板',
    meta: `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      `
  }

  app.get('/demo2/*', (req, res) => {
    const vueApp = new Vue({
      data: {
        url: req.url
      },
      template: `<div> 这是一个 SSR 站点 {{url}} </div>`
    })

    renderer.renderToString(vueApp, content, (err, html) => {
      res.end(html)
    })
  })
}

demo1()
demo2()
app.listen(8880, () => {
  console.log('start http://localhost:8880/demo1/简单VueToHtml')
  console.log('start http://localhost:8880/demo2/一个模板')
})