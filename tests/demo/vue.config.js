module.exports = {
  pluginOptions: {
    graphqlMock: false,
    apolloEngine: false,
  },
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    proxy: {
      "^/postgraphile/demo/ws": {
        target: "http://localhost:16000",
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/postgraphile/demo/ws": "/"
        }
      },
      "^/postgraphile/demo": {
        target: "http://localhost:16000",
        ws: false,
        pathRewrite: {
          "^/postgraphile/demo": "/"
        }
      },
    }
  },
 publicPath: '/demo',

  /* Without vue-cli-plugin-apollo 0.20.0+ */
  // chainWebpack: config => {
  //   config.module
  //     .rule('vue')
  //     .use('vue-loader')
  //       .loader('vue-loader')
  //       .tap(options => {
  //         options.transpileOptions = {
  //           transforms: {
  //             dangerousTaggedTemplateString: true,
  //           },
  //         }
  //         return options
  //       })
  // }
}
