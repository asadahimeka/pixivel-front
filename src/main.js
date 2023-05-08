import "buefy/dist/buefy.css";
import "@/assets/css/bulmaswatch.min.css";
import "@/assets/sass/dark.sass";
import "@iconscout/unicons/css/line.css";

import Vue from "vue";
import Buefy from "buefy";
import axios from "axios";
import moment from "moment";
import Lodash from "lodash";
import VueAxios from "vue-axios";
import VirtualMasonry from "vue-virtual-masonry";
import InfiniteLoading from "vue-infinite-loading";

import App from "@/App.vue";
import CONFIG from "@/config";
import router from "@/router";
import Store from "@/store";
import ImgReso from "@/utils/ImgReso";

import "@/utils/prototypes";
import "./registerServiceWorker";

moment.locale("zh-cn");

axios.interceptors.request.use((config) => {
  if (!config["background"]) {
    config.cancelToken = new axios.CancelToken((e) => {
      Store.commit("CancelRequests/addCancelToken", e);
    });
  }
  return config;
});

router.beforeEach((to, from, next) => {
  Store.commit("CancelRequests/clearCancelToken");
  next();
});

Vue.config.productionTip = false;
Vue.filter("dateFormat", function (daraStr, pattern = "YYYY-MM-DD HH:mm:ss") {
  return moment(daraStr).format(pattern);
});
Vue.use(Buefy);
Vue.use(VueAxios, axios);
Vue.use(VirtualMasonry, {
  additionalDistance: 1000,
});
Vue.use(InfiniteLoading);

Vue.prototype.moment = moment;
Vue.prototype.Lodash = Lodash;
Vue.prototype.calcImg = ImgReso.calcImg;
Vue.prototype.imgProxy = ImgReso.imgProxy;
Vue.prototype.calcUgoira = ImgReso.calcUgoira;
Vue.prototype.getDownloadMessage = () => {
  return CONFIG.DOWNLOAD_DEFAULT.TASK_MESSAGES[
    Math.floor(Math.random() * CONFIG.DOWNLOAD_DEFAULT.TASK_MESSAGES.length)
  ];
};

new Vue({
  router,
  render: (h) => h(App),
  store: Store,
}).$mount("#app");
