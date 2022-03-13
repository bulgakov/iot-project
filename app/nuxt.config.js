export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'IoT Project',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Poppins:200,300,400,600,700,800'},
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'}
    ],
    bodyAttrs: {
      class: '' // Add `white-content` class here to enable "white" mode.
    }
  },

  router: {
    linkExactActiveClass: 'active'
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'assets/css/demo.css',
    'assets/css/nucleo-icons.css',
    'assets/sass/black-dashboard.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/dashboard-plugin.js' },
    { src: '~/plugins/vue.plugin.js', ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/i18n',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: process.env.API_URL,
  },

  env: {
    mqtt_ssl_prefix: process.env.EMQX_SSL_PREFIX,
    mqtt_host: process.env.EMQX_HOST,
    mqtt_ws_port: process.env.MQTT_WS_PORT,
  },
  
  // i18n module configuration: https://i18n.nuxtjs.org/
  i18n: {
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', iso: 'en-US', file: 'en.js', dir: 'ltr' },
      { code: 'es', name: 'Español', iso: 'es-ES', file: 'es.js' },
    ],
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/, 'lodash-es', 'vue-chart-3'],
    extend(config, ctx) {
        
    },
    babel: {
        plugins: [
            [
                'component',
                {
                    libraryName: 'element-ui',
                    styleLibraryName: 'theme-chalk'
                }
            ]
        ]
    }
  },
}
