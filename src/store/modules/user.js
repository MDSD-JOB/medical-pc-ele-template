import { access, login, getUserBackMenu, getAllSource } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  roles: [],
  allSource: [],
  userSource: [],
  permissions: [],
  info: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSION: (state, data) => {
    state.permissions = data
  },
  SET_ALL_SOURCE: (state, data) => {
    state.allSource = data
  },
  SET_USER_SOURCE: (state, data) => {
    state.userSource = data
  },
  SET_INFO: (state, info) => {
    state.info = info
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    // eslint-disable-next-line
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          ...userInfo,
          grant_type: process.env.VUE_APP_GRANT_TYPE,
          client_id: process.env.VUE_APP_CLIENT_ID,
          client_secret: process.env.VUE_APP_CLIENT_SECRET
        }
        const tokenRes = await access(params)
        const accessToken = tokenRes.result.accessToken
        commit('SET_TOKEN', accessToken)
        setToken(accessToken)
        resolve()
      } catch (error) {
        throw new Error(error)
      }
    })
  },

  // get user info
  getInfo({ commit, state }) {
    // eslint-disable-next-line
    return new Promise(async (resolve, reject) => {
      getAllSource()
        .then((response) => {
          commit('SET_ALL_SOURCE', response.result)
        })
        .catch((error) => {
          reject(error)
        })
      getUserBackMenu()
        .then((response) => {
          commit('SET_USER_SOURCE', response.result)
        })
        .catch((error) => {
          reject(error)
        })
      await login()
        .then((response) => {
          const permissions = response.result.permissions
          const user = response.result.user
          commit('SET_ROLES', permissions)
          commit('SET_PERMISSION', permissions)
          commit('SET_INFO', user)
          resolve(permissions)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSION', [])
      commit('SET_ALL_SOURCE', [])
      commit('SET_USER_SOURCE', [])
      commit('SET_INFO', null)
      removeToken()
      resetRouter()

      // reset visited views and cached views
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, {
      root: true
    })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
