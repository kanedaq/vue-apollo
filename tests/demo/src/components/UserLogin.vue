<script>
import UserCurrent from '../mixins/UserCurrent'
import USER_CURRENT from '../graphql/userCurrent.gql'
import { onLogin, readGitlabState } from '../vue-apollo'
import { getUrlQueries } from '../common'
import USER_LOGIN from '../graphql/userLogin.gql'

export default {
  name: 'UserLogin',

  mixins: [
    UserCurrent,
  ],

  data () {
    return {
      showRegister: false,
      email: '',
      password: '',
      nickname: '',
    }
  },

  watch: {
    // https://qiita.com/HayatoKamono/items/5958d8648007adf6881b
    isOpen: {
      immediate: true,
      async handler () {
        let queries = getUrlQueries()
        let state = readGitlabState()
        if (queries['state'] && queries['state'] === state) {
          await this.$apollo.mutate({
            mutation: USER_LOGIN,
            variables: {
              input: {
                authorizationCode: queries['code'],
              },
            },
          }).then(async (res) => {
            const apolloClient = this.$apollo.provider.defaultClient
            await onLogin(apolloClient, res.data.userLogin.usrAndToken.token)
            apolloClient.writeQuery({
              query: USER_CURRENT,
              data: {
                userCurrent: res.data.userLogin.usrAndToken.usr,
              },
            })
            this.redirect()
          }).catch((error) => {
            console.error(error)
          })
        }
        // localStorage.removeItem(AUTH_GITLAB_STATE)
      },
    },
  },

  methods: {
    redirect () {
      this.$router.replace(this.$route.params.wantedRoute || { name: 'home' })
    },
  },
}
</script>

<template>
  <div class="user-login">
    <div class="logo">
      <i class="material-icons icon">chat</i>
    </div>
    <div class="app-name">
      Apollo<b>Chat</b>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.user-login
  height 100%
  display flex
  flex-direction column
  align-items center
  justify-content center

.logo
  .icon
    font-size 80px
    color $color

.app-name
  font-size 42px
  font-weight lighter
  margin-bottom 32px

.wrapper
  flex auto 0 0

.form
  width 100vw
  max-width 300px

.form-input,
.button
  display block
  width 100%
  box-sizing border-box

.form-input
  margin-bottom 12px

.actions
  margin-top 12px
  text-align center
  font-size 12px
</style>
