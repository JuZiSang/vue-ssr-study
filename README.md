# vue-ssr-study
研究从 0 使用 vue-server-renderer 搭建 ssr

## 什么是服务器渲染（SSR）？

>> Vue.js 是构建客户端应用程序的框架。默认情况下，可以在浏览器中输出 Vue 组件，进行生成 DOM 和操作 DOM。然而，也可以将同一个组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将这些静态标记**"激活"**为客户端上完全可交互的应用程序。

### 为什么需要服务端渲染？

在保障开发现代 Web 程序体验的基础之下，给予程序

- 更好的 SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面。
- 更快的内容到达时间 (time-to-content)

使用服务的渲染，额外需要做的

- 开发条件所限。浏览器特定的代码，只能在某些生命周期钩子函数 (lifecycle hook) 中使用；一些外部扩展库 (external library) 可能需要特殊处理，才能在服务器渲染应用程序中运行。
- 涉及构建设置和部署的更多要求。与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同，服务器渲染应用程序，需要处于 Node.js server 运行环境。
- 更多的服务器端负载。在 Node.js 中渲染完整的应用程序，显然会比仅仅提供静态文件的 server 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)

### 服务的渲染 和 预渲染 (SSR vs Prerendering)

如果你不需要将 Ajax 获取的数据，同步在后端转换为 Html 输出，用 Vue 只是写了一个完全静态的页面，则完全可以不使用 SSR 来渲染，采用预渲染才是比较明智的选择

webpack [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin) 插件，可以将 Vue 项目转换为 Html，你可以和以前单页面一样，作为静态文件部署

## 参考
- [Vue SSR 指南](https://ssr.vuejs.org/zh/)
- [HackerNews Demo](https://github.com/vuejs/vue-hackernews-2.0/)