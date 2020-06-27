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