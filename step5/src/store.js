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