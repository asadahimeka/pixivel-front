const path = require("path");

module.exports = {
  productionSourceMap: false,
  configureWebpack: () => ({
    devtool: "source-map",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
  pwa: {
    name: "Pixivel",
    themeColor: "#00e2bc",
    msTileColor: "#000000",
    manifestOptions: {
      name: "Pixivel",
      short_name: "Pixivel",
      theme_color: "#00e2bc",
      background_color: "#fafafa",
      display: "standalone",
      scope: "./",
      start_url: "./",
      id: "/",
      icons: [
        {
          src: "img/icons/icon-48x48.png",
          sizes: "48x48",
          type: "image/png",
        },
        {
          src: "img/icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          src: "img/icons/icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "img/icons/icon-128x128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "img/icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "img/icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
        },
        {
          src: "img/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "img/icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "img/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "#00cea8",
    iconPaths: {
      maskicon: null,
      favicon32: "img/icons/icon-48x48.png",
      favicon16: "favicon.ico",
      appleTouchIcon: null,
      msTileImage: null,
    },
    workboxPluginMode: "GenerateSW",
    workboxOptions: {
      exclude: ["ads.txt"],
      skipWaiting: true,
      clientsClaim: true,
      importWorkboxFrom: "local",
      importsDirectory: "js",
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.kanata\.ml\/?$/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "index-cache",
            cacheableResponse: { statuses: [200] },
          },
        },
        {
          urlPattern: /.*\.html$/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "html-files",
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /.*\.(css|js)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "static-files",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /.*\.(png|gif|jpg|jpeg|ico|svg|cur|mp4|woff2?)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "static-imgs",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/hibi.*\.cocomi\.cf/,
          handler: "CacheFirst",
          options: {
            cacheName: "api",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxAgeSeconds: 86400 * 1,
              maxEntries: 30000,
            },
          },
        },
      ],
    },
  },
};
