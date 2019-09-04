import Vue from 'vue'
import VueApollo from '../../../'
import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getUrlQueries } from './common'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'postgraphile-demo-token'
const AUTH_GITLAB_STATE = 'postgraphile-demo-gitlab-state'

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint: process.env.VUE_APP_GRAPHQL_HTTP || 'http://localhost:4000/graphql',
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,
  // Override default http link
  // link: myLink,
  // Override default cache
  // cache: myCache,
  cache: new InMemoryCache(),
  // Additional ApolloClient options
  // apollo: { ... }
  getAuth: tokenName => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem(tokenName)
    // return the headers to the context so httpLink can read them
    return token ? ('Bearer ' + token) : ''
  },

  gitlab_authorization_endpoint: 'http://localhost:10080/oauth/authorize',
  gitlab_response_type: 'code',
  gitlab_client_id: 'cfd5dbe5d3093f2eb497030463737dc8438ead0e3779563ead3aaefdfc0838da',
  gitlab_scope: 'openid email',
  gitlab_redirect_uri: 'http://localhost:8080/demo/login',
}

export function readGitlabState () {
  return localStorage.getItem(AUTH_GITLAB_STATE)
}

export function redirectGitlab () {
  let queries = getUrlQueries()
  if (!queries['code']) {
    let state = 'abcde'
    localStorage.setItem(AUTH_GITLAB_STATE, state)
    localStorage.removeItem(AUTH_TOKEN)
    window.location = `${defaultOptions.gitlab_authorization_endpoint}?response_type=${defaultOptions.gitlab_response_type}&state=${state}&client_id=${defaultOptions.gitlab_client_id}&scope=${defaultOptions.gitlab_scope}&redirect_uri=${defaultOptions.gitlab_redirect_uri}`
  }
}

// Call this in the Vue app file
export function createProvider (options = {}, { router }) {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options,
  })
  apolloClient.wsClient = wsClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: 'cache-and-network',
      },
    },
    errorHandler (error) {
      if (isUnauthorizedError(error)) {
        // Redirect to login page
        if (router.currentRoute.name !== 'login') {
          router.replace({
            name: 'login',
            params: {
              wantedRoute: router.currentRoute.fullPath,
            },
          })
        }
      } else {
        console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', error.message)
      }
    },
  })

  return apolloProvider
}

// Manually call this when user log in
export async function onLogin (apolloClient, token) {
  localStorage.setItem(AUTH_TOKEN, token)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (login)', 'color: orange;', e.message)
    }
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  localStorage.removeItem(AUTH_TOKEN)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
    }
  }
}

function isUnauthorizedError (error) {
  if (error) {
    if (error.message.indexOf('Unauthorized') >= 0 || error.message.indexOf('permission denied') >= 0 || error.message.indexOf('status code 401') >= 0) {
      return true
    }
  }
  return false
}
