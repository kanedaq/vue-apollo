import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { redirectGitlab, createProvider } from './vue-apollo'

Vue.config.productionTip = false

redirectGitlab()
const apolloProvider = createProvider({}, { router })

new Vue({
  router,
  store,
  apolloProvider,
  ...App,
}).$mount('#app')
