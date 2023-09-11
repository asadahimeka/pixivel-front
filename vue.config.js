const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  productionSourceMap: false,
  configureWebpack: (config) => {
    if (isProduction) {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
    }
  },
  pwa: {
    name: "Pxelk",
    themeColor: "#8F77B5",
    msTileColor: "#000000",
    manifestOptions: {
      name: "Pxelk",
      short_name: "Pxelk",
      theme_color: "#8F77B5",
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
          src: "img/icons/icon-256x256.png",
          sizes: "256x256",
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
    appleMobileWebAppStatusBarStyle: "#8F77B5",
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
      runtimeCaching: [],
    },
  },
};
