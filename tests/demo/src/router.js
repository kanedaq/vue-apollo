import Vue from 'vue'
import Router from 'vue-router'
import UserLogin from './components/UserLogin.vue'
import WelcomeView from './components/WelcomeView.vue'
import ChannelView from './components/ChannelView.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: WelcomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: UserLogin,
    },
    {
      path: '/chan/:id',
      name: 'channel',
      component: ChannelView,
      props: true,
    },
  ],
})
