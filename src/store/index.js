import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    objs: null,
    fetched: false,
    obj: null,
  },
  actions: {
    async getObjs({ state }) {
      state.fetched = false
      try {
        const response = await axios.get('https://fl.drros.ru/api/assets/')
        state.objs = response.data
      } finally {
        state.fetched = true
      }
    },
    async getObj({ state }, id) {
      state.fetched = false
      try {
        const response = await axios.get(`https://fl.drros.ru/api/assets/${id}`)
        state.obj = response.data
      } finally {
        state.fetched = true
      }
    }
  },
  modules: {
  }
})
