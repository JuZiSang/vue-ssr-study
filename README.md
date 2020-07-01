# vue-ssr-study

研究从 0 使用 vue-server-renderer 搭建 ssr

## 什么是服务器渲染（SSR）？

> Vue.js 是构建客户端应用程序的框架。默认情况下，可以在浏览器中输出 Vue 组件，进行生成 DOM 和操作 DOM。然而，也可以将同一个组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将这些静态标记**"激活"**为客户端上完全可交互的应用程序。

### 为什么需要服务端渲染？

在保障现代 Web 程序开发体验的基础之下，给予程序

- 更好的 SEO
- 加载更快，减少白屏时间

使用服务的渲染，以下几点需要知道

-  依赖浏览器运行环境的库，只能在特定的生命周期钩子中运行，如`mounted`
- 必须要依赖 Nodejs 环境
- 相比静态文件，将会占用大量的 CPU 资源

### 服务的渲染 和 预渲染

如果你不需要将 Ajax 获取的数据，同步在后端转换为 Html 输出，用 Vue 只是写了一个完全静态的页面，则完全可以不使用 SSR 来渲染，采用预渲染才是比较明智的选择

webpack [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin) 插件，可以将 Vue 项目转换为 Html，你可以和以前一样，作为静态文件部署

### 编写需要同时运作在服务端及客户端的代码，应该注意

- 运行在服务端中的 Vue 实例，将会禁用响应式对象
- 组件生命周期
  - 服务端：只有 `beforeCreate` 和 `created` 会在服务器端渲染 (SSR) 过程中被调用
  - 客户端：其它生命周期方法会在客户端执行
  - 避免在 `beforeCreate` 和 `created` 中调用 `setInterval` , 由于在服务端运行时，永远不会调用到销毁的生命周期 `beforeDestroy` ，我们没有机会销毁这个 timer
- 不要访问特定平台独有的 API，如：`window` 或 `document`
- 自定义指令
  - 不要在 SSR 应用程序中编写操作 DOM 的指令，可以用父子组件代替

## 开始从零配置

### Vue 实例转换 Html，模板插值

- vue-server-renderer 包，用来将 Vue 实例转换为 HTML 的主要工具

[server.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step1/src/server.js#L9)

```js
const renderer = require("vue-server-renderer").createRenderer();
app.get("/demo1/*", (req, res) => {
  const vueApp = new Vue({
    data: {
      url: req.url,
    },
    template: `<div> 这是一个 SSR 站点 {{url}} </div>`,
  });
  renderer.renderToString(vueApp, (err, html) => {
    // 将会得到 <div> 这是一个 SSR 站点 /demo1/xxx </div>
    // 注意，并不会生成 Html 文档，需要手动设置 Html 模板
    res.end(html);
  });
});
```

- 设置模板，及模板插值

[server.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step1/src/server.js#L35)

```js
const renderer = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync(
    path.join(__dirname, "./template.html"),
    "utf-8"
  ),
});

// 需要插入模板当值的值
const content = {
  title: "这是一个 HTML 模板",
  meta: `
      // 模板中最好带上这个，否则会乱码
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      `,
};

app.get("/demo2/*", (req, res) => {
  const vueApp = new Vue({
    data: {
      url: req.url,
    },
    template: `<div> 这是一个 SSR 站点 {{url}} </div>`,
  });

  renderer.renderToString(vueApp, content, (err, html) => {
    res.end(html);
  });
});
```

[template.html](https://github.com/JuZiSang/vue-ssr-study/blob/master/step1/src/template.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- 使用三花括号(triple-mustache)进行 HTML 不转义插值(non-HTML-escaped interpolation) -->
    {{{ meta }}}
    <!-- 使用双花括号(double-mustache)进行 HTML 转义插值(HTML-escaped interpolation) -->
    <title>{{ title }}</title>
  </head>
  <body>
    <!-- 组件生成的内容，将会插入这里 -->
    <!--vue-ssr-outlet-->
  </body>
</html>
```

### webpack 打包 Vue 文件，及客户端服务端任何引用

- 配合 webpack 打包 Vue 组件
  我们将有两个入口，服务的运行入口，客户端运行入口。
  ![SSR 运行流程](https://raw.githubusercontent.com/JuZiSang/vue-ssr-study/master/screenshot/1.png)

我将 webpack 配置分为三个

- config
  - webpack.base.config.js
  - webpack.client.config.js
  - webpack.server.config.js
- src
  - App.vue
  - app.js client server 公共代码
  - entry-client.js
  - entry-server.js

[app.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/src/app.js)

```js
import Vue from "vue";
import App from "./App.vue";
/**
 * entry-client.js entry-server.js 都会引用这个文件创建 Vue 实例
 * 导出一个工厂函数，用于创建新的
 * 应用程序、router 和 store 实例
 */
export function createApp() {
  const app = new Vue({
    render: (h) => h(App),
  });
  return { app };
}
```

[entry-server.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/src/entry-server.js)

```js
/**
 * 服务端入口，我们会在 server.js 中引用
 * 返回一个方法的原因是，可能会有一些配置，需要外部传递
 */
import { createApp } from "./app";

export default (context) => {
  const { app } = createApp();
  return app;
};
```

[entry-client.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/src/entry-client.js)

```js
/**
 * 客户端入口，此时已经是渲染好的Html，我们只需要激活节点，让静态html拥有Vue的能力
 * 如点击交互，各种显示隐藏
 */
import { createApp } from "./app";

const { app } = createApp();

app.$mount("#app");
```

base 配置见 [webpack.base.config.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/config/webpack.base.config.js) 不详细讲了，我们主要注意`client` `server`两个入口的打包配置

[webpack.server.config.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/config/webpack.server.config.js)

```js
module.exports = merge(base, {
  target: "node",
  entry: "./src/entry-server.js",
  // 因为 nodejs 中只能用 require，所以打包输出采用 commonjs 规范
  output: {
    filename: "server-bundle.js",
    libraryTarget: "commonjs2",
    // 注意，这里默认导出最好这样填，否则你引入 server 端运行时
    // 可能需要 require('server-bundle').default
    libraryExport: "default",
  },
});
```

[webpack.client.config.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/config/webpack.client.config.js)

```js
module.exports = merge(base, {
  entry: "./src/entry-client.js",
  output: {
    filename: "client-bundle.js",
  },
});
```

[server.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step2/server.js)

```js
// 引入服务器的打包入口
const createApp = require("./dist/server-bundle");
// 模板插值 XXX
const content = {};
// 创建Vue实例
renderer.renderToString(createApp(), content, (err, html) => {
  res.end(html);
});
```

### 引入路由 vue-router

[router.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step3/src/router.js)
```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/home',
        component: () => import('./views/Home.vue')
      },
      {
        path: '/about',
        component: () => import('./views/About.vue')
      },
      // 如果不写这个，刷新会报错，并且如果直接访问根路径，会一直转圈圈
      {
        path: '*',
        redirect: '/home'
      }
    ]
  })
}
```

[app.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step3/src/app.js)
```js
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'

/**
 * 导出一个工厂函数，用于创建新的
 * 应用程序、router 和 store 实例
 */
export function createApp() {
  // 创建 router 实例
  const router = createRouter()
  
  const app = new Vue({
    // 注入 router 到根 Vue 实例
    router,
    render: h => h(App)
  })

  return { app, router }
}
```

[entry-server.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step3/src/entry-server.js)
```js
export default context => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()
    // 设置服务器端 router 的位置
    router.push(context.url)
    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      // Promise 应该 resolve 应用程序实例，以便它可以渲染
      resolve(app)
    }, reject)
  })
}
```

[entry-client.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step3/src/entry-client.js)
```js
import { createApp } from './app'

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})
```

### 引入 vuex
[store.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step4/src/store.js)
```js
// store.js
import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)

export function createStore() {
  return new Vuex.Store({
    state: {
      items: {}
    },
    actions: {
      fetchItem({ commit }, id) {
        // 请求数据见 https://github.com/JuZiSang/vue-ssr-study/blob/master/step4/server.js
        // `store.dispatch()` 会返回 Promise，
        // 以便我们能够知道数据在何时更新
        return Axios.get('http://127.0.0.1:8880/api/item')
          .then((item) => {
            console.log(item.data.data)
            commit('setItem', item.data.data)
          })
          .catch(err => {
            console.log('catch:', err)
            throw err
          })
      }
    },
    mutations: {
      setItem(state, item) {
        state.items = item
      }
    }
  })
}
```

[app.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step4/src/app.js)
```js
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'

/**
 * 导出一个工厂函数，用于创建新的
 * 应用程序、router 和 store 实例
 */
export function createApp() {
  // 创建 router store 实例
  const router = createRouter()
  const store = createStore()

  // 同步路由状态(route state)到 store
  sync(store, router)

  const app = new Vue({
    // 注入 router store 到根 Vue 实例
    router,
    store,
    render: h => h(App)
  })

  // 暴露 app, router 和 store。
  return { app, router, store }
}
```

[entry-server.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step4/src/entry-server.js)
```js
import { createApp } from './app'

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()
    // 设置服务器端 router 的位置
    router.push(context.url)
    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      // Promise 应该 resolve 应用程序实例，以便它可以渲染
      resolve(app)
    }, reject)
  })
}
```

[entry-client.js](https://github.com/JuZiSang/vue-ssr-study/blob/master/step4/src/entry-client.js)
```js
import { createApp } from './app'

const { app, router, store } = createApp()

// 将 SSR 注入的数据，填充到Vuex
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  app.$mount('#app')
})
```

### CSS 管理

[CSS 管理](https://github.com/JuZiSang/vue-ssr-study/blob/master/step6)
 

## 参考

- [Vue SSR 指南](https://ssr.vuejs.org/zh/)
- [HackerNews Demo](https://github.com/vuejs/vue-hackernews-2.0/)
