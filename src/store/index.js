import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    objs: null,
    fetched: false,
  },
  actions: {
    async getObjs({ state }, payload = {}) {
      state.fetched = false
      state.objs = null
      try {
        const response = await axios.get('https://fl.drros.ru/api/assets/', {
          params: {
            ...payload
          }
        })
        state.objs = response.data
      } catch (e) {
        state.objs = null
        state.fetched = true
      } finally {
        state.fetched = true
      }
    }
  },
  modules: {
  }
})
