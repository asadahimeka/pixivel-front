<template>
  <section class="section default-full-screen-top no-padding-phone">
    <div class="container is-fluid no-padding-phone">
      <div class="columns">
        <div class="column no-padding-phone">
          <Presentation
            :id="illust.id"
            :initial-width="illust.width"
            :initial-height="illust.height"
            :ugoira-frames="ugoiraFrames"
            :image="illust.image"
            :page-count="pageCount"
            @progress="updateImageLoading"
            @forcefetch="triggerForceFetchIllust"
            v-if="illust && isIllustShow"
            ref="present"
          />
          <div v-if="illust && !isIllustShow" class="ill_hide_tip">
            <p>根据当前设置，此内容不予显示</p>
          </div>
        </div>
        <div class="column is-one-quarter">
          <div
            class="container is-fluid no-padding-comp top-padding-phone img-info"
          >
            <div>
              <template v-if="illust">
                <h1 class="title is-2" style="margin-bottom: 0.6rem">
                  {{ illust.title }}
                </h1>
                <!-- <small>{{ illust.altTitle }}</small> -->
                <template v-if="illust.aiType === 2">
                  <b-tag
                    size="is-medium"
                    type="is-warning"
                    style="margin-right: 0.5rem"
                  >
                    AI生成
                  </b-tag>
                </template>
                <template v-if="illust.xRestrict > 0">
                  <b-tag
                    size="is-medium"
                    style="background-color: #f14668; color: #fff"
                  >
                    NSFW
                  </b-tag>
                </template>
              </template>
              <template v-else>
                <b-skeleton width="20%" height="2rem"></b-skeleton>
                <b-skeleton width="40%" height=".875em"></b-skeleton>
              </template>
              <hr />
            </div>
            <b-taglist class="little-top-margin" v-if="illust">
              <template v-for="tag in illust.tags">
                <b-tag
                  type="is-info is-light"
                  class="clickable-tag"
                  :key="tag.name"
                  @click.native="searchtag(tag.name)"
                  >{{ tag.name }}</b-tag
                >
                <b-tag
                  type="is-link is-light"
                  class="clickable-tag"
                  v-if="tag.translated_name"
                  :key="tag.translated_name + Math.random()"
                  @click.native="searchtag(tag.translated_name)"
                  >{{ tag.translated_name }}</b-tag
                >
              </template>
            </b-taglist>
            <div style="margin-bottom: 1.5rem">
              <v-clamp
                class="subtitle is-6 break-raw-text"
                style="margin-top: 0.6rem"
                autoresize
                :max-lines="5"
                tag="p"
                v-if="illust"
              >
                <template slot="default">{{
                  illust.description | htmlFilter
                }}</template>
                <template #after="{ toggle, expanded, clamped }">
                  <b-tag
                    type="is-success is-light"
                    v-if="expanded || clamped"
                    class="clickable-tag expand-tag-button"
                    size="is-small"
                    @click.native="toggle"
                    >{{ expanded ? "收起" : "展开" }}</b-tag
                  >
                </template>
              </v-clamp>
              <template v-else>
                <b-skeleton width="100%" height="15px" :count="3"></b-skeleton>
                <b-skeleton width="30%" height="15px"></b-skeleton>
              </template>
            </div>
            <RouterA
              class="media is-vertical-centered"
              :to="{ name: 'User', params: { id: illust.user.id } }"
              v-if="illust"
            >
              <div class="media-left">
                <figure class="image is-64x64">
                  <img
                    :src="imgProxy(illust.user.image.url, illust.user.id)"
                    class="is-rounded full-hw obj-cover"
                  />
                </figure>
              </div>
              <div>
                <h1 class="title is-4">{{ illust.user.name }}</h1>
              </div>
            </RouterA>
            <HScroll
              :illusts="userIllusts"
              v-if="illust && isIllustShow"
              @load="loadUserIllusts"
              :has-load="userIllustsShowLoading"
              ref="userIllusts"
            ></HScroll>
            <div class="statistic" v-if="illust && isIllustShow">
              <div class="statistic-item">
                <b-icon pack="uil" icon="uil-eye" size="is-small"></b-icon>
                {{ illust.statistic.views }}
              </div>
              <div class="statistic-item">
                <b-icon
                  pack="uil"
                  icon="uil-thumbs-up"
                  size="is-small"
                ></b-icon>
                {{ illust.statistic.likes }}
              </div>
              <div class="statistic-item">
                <b-icon pack="uil" icon="uil-heart" size="is-small"></b-icon>
                {{ illust.statistic.bookmarks }}
              </div>
              <div class="statistic-item">
                <b-icon pack="uil" icon="uil-comment" size="is-small"></b-icon>
                {{ illust.statistic.comments }}
              </div>
              <div class="content">
                {{ illust.createDate | dateFormat("LL") }}
              </div>
            </div>
            <div
              class="notification is-primary img-progress"
              v-if="illust && isIllustShow"
              :style="{
                'background-image': `linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) ${imgprogress}%, rgb(200, 200, 200) ${imgprogress}%, rgb(200, 200, 200) 100%)`,
              }"
            >
              <div class="buttons is-centered">
                <!-- <div class="like-container" v-if="islogin">
                  <Like :illust="illust" />
                </div> -->
                <b-button type="is-primary" inverted @click="saveDirect">{{
                  imgprogress == 100 ? "保存" : parseInt(imgprogress) + "%"
                }}</b-button>
                <b-button
                  type="is-primary"
                  inverted
                  outlined
                  v-if="illust.pageCount > 1"
                  @click="saveDirectAll"
                  >保存所有</b-button
                >
                <b-button type="is-primary" inverted outlined>
                  <a
                    :href="`https://www.pixiv.net/artworks/${illust.id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="color: inherit; text-decoration: none"
                    >在 Pixiv 上查看</a
                  >
                </b-button>
                <!-- <ShareButton :type="0" :id="illust.id" :info="illust.title" /> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="container huge-top-margin"
      v-if="illust && illust.aiType < 2 && illust.xRestrict < 1"
    >
      <WaterFall
        :illusts="recommendIllusts"
        :identifier="recommendIllustsIdentifier"
      />
      <infinite-loading
        @infinite="recommendIllustsPageNext"
        spinner="spiral"
        :identifier="recommendIllustsIdentifier"
      >
        <div slot="no-more">加载完毕</div>
        <div slot="no-results">记录为空</div>
        <div slot="error" slot-scope="{ trigger }">
          <div class="notification is-danger">
            <div class="buttons">
              <b-button type="is-primary" inverted @click="trigger"
                >重试</b-button
              >
            </div>
          </div>
        </div>
      </infinite-loading>
    </div>
  </section>
</template>

<script>
import Lodash from "lodash";
import Presentation from "@/components/presentation.vue";
import CONFIG from "@/config";
import VClamp from "vue-clamp";
import WaterFall from "@/components/waterfall";
import HScroll from "@/components/horizontal_scroll";
import RouterA from "@/components/router_a";
// import Like from "@/components/like_heart";
import { addHistory } from "@/utils/history";
import { isLoggedIn } from "@/utils/account";
// import ShareButton from "@/components/share_button";
import { adaptIllust, adaptIllusts, isItemShow } from "@/utils/adapter";

export default {
  name: "Detail",
  components: {
    Presentation,
    VClamp,
    WaterFall,
    HScroll,
    RouterA,
    // Like,
    // ShareButton,
  },
  data: () => ({
    id: 0,
    loading: null,
    illust: null,
    recommendIllusts: [],
    recommendIllustsPage: 0,
    recommendIllustsIdentifier: +new Date(),
    ugoiraFrames: [],
    userIllusts: [],
    userIllustsPage: 0,
    userIllustsLoading: false,
    userIllustsShowLoading: true,
    imgprogress: 100,
    islogin: isLoggedIn(),
  }),
  watch: {
    $route() {
      this.id = this.$route.params.id;
      this.$set(
        this,
        "illust",
        this.$store.getters["Cache/get"](
          {
            type: "illust",
            id: this.id,
          },
          null
        )
      );
      if (!this.illust) {
        this.load();
      }
      this.userIllusts = [];
      this.ugoiraFrames = [];
      this.userIllustsPage = 0;
      this.userIllustsLoading = false;
      this.refreshRecommend();
    },
    illust() {
      if (this.illust) {
        this.$store.commit("Cache/cacheState", {
          key: {
            type: "illust",
            id: this.id,
          },
          val: this.illust,
        });
        addHistory(this.illust);
        this.loadUserIllusts(true);
        this.recommendIllustsInit();
      }
    },
  },
  created() {
    this.id = this.$route.params.id;
    this.illust = this.$store.getters["Cache/get"](
      {
        type: "illust",
        id: this.id,
      },
      null
    );
  },
  mounted() {
    if (!this.illust) {
      this.load();
    }
    this.refreshRecommend();
  },
  beforeDestroy() {
    if (this.loading) {
      this.loading.close();
    }
  },
  methods: {
    error(message) {
      this.$buefy.notification.open({
        duration: 5000,
        message: message,
        type: "is-danger",
      });
    },
    loadUgoira() {
      this.axios
        .get(CONFIG.API_HOST + `ugoira_metadata?id=${this.id}`)
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            return;
          }
          this.ugoiraFrames = response.data.ugoira_metadata.frames;
          this.loading.close();
        })
        .catch((error) => {
          console.error(error);
          this.error(error.message);
          this.loading.close();
        });
    },
    load(force) {
      this.loading = this.$buefy.loading.open();
      this.axios
        .get(CONFIG.API_HOST + `illust?id=${this.id}`)
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            this.loading.close();
            return;
          }
          this.illust = adaptIllust(response.data.illust);
          if (this.illust.type == 2) {
            this.loadUgoira(force);
          } else {
            this.loading.close();
          }
        })
        .catch((error) => {
          console.error(error);
          this.error(error.message);
          this.loading.close();
        });
    },
    loadUserIllusts(tryloadcache = false) {
      if (this.userIllustsLoading == true) return;
      this.userIllustsLoading = true;
      if (tryloadcache) {
        let cachedUesrIllusts = this.$store.getters["Cache/get"](
          {
            type: "userIllust",
            id: this.illust.user.id,
          },
          null
        );
        if (cachedUesrIllusts) {
          this.userIllustsPage = cachedUesrIllusts["page"];
          this.userIllusts = cachedUesrIllusts["illusts"];
          this.userIllustsShowLoading = cachedUesrIllusts["showloading"];
          this.$nextTick(() => {
            this.findIllustUserPos();
          });
          this.userIllustsLoading = false;
          return;
        }
      }

      this.axios
        .get(CONFIG.API_HOST + `member_illust?id=${this.illust.user.id}`, {
          params: {
            page: this.userIllustsPage + 1,
          },
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            return;
          }
          // if (!response.data.next_url) {
          this.userIllustsShowLoading = false;
          // }
          this.userIllusts = this.Lodash.uniqBy(
            this.userIllusts.concat(adaptIllusts(response.data.illusts)),
            "id"
          );
          if (this.userIllustsPage == 0) {
            this.$nextTick(() => {
              this.findIllustUserPos();
            });
          }
          // this.userIllustsPage += 1;
          this.userIllustsLoading = false;
          this.$store.commit("Cache/cacheState", {
            key: {
              type: "userIllust",
              id: this.illust.user.id,
            },
            val: {
              page: this.userIllustsPage,
              illusts: this.userIllusts,
              showloading: this.userIllustsShowLoading,
            },
          });
        })
        .catch((error) => {
          this.userIllustsLoading = false;
          this.error(error.message);
        });
    },
    refreshRecommend() {
      this.recommendIllusts = [];
      this.recommendIllustsPage = 0;
      this.recommendIllustsIdentifier += 1;
    },
    findIllustUserPos() {
      if (!this.isIllustShow) return;
      let sanity = this.$store.getters["Settings/get"]("global.sanity_filter");
      let userIllusts = this.userIllusts.filter((item) => {
        return isItemShow(item) && item.sanity < sanity;
      });
      let targetIndex = this.Lodash.findIndex(userIllusts, (item) => {
        return item.id == this.id;
      });
      let leftDis = targetIndex * 184;
      if (leftDis > this.$refs.userIllusts.$el.clientWidth / 2 - 92) {
        leftDis -= this.$refs.userIllusts.$el.clientWidth / 2 - 92;
      }
      this.$refs.userIllusts.$el.scrollTo({
        left: leftDis,
      });
    },
    recommendIllustsInit() {
      let cachedRecommendIllusts = this.$store.getters["Cache/get"](
        {
          type: "recommendIllust",
          id: this.id,
        },
        null
      );
      if (cachedRecommendIllusts) {
        this.recommendIllustsPage = cachedRecommendIllusts["page"];
        this.recommendIllusts = cachedRecommendIllusts["illusts"];
      }
    },
    recommendIllustsPageNext: Lodash.throttle(function ($state) {
      this.axios
        .get(CONFIG.API_HOST + `related?id=${this.id}`, {
          params: {
            page: this.recommendIllustsPage + 1,
          },
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            $state.error();
            return;
          }
          if (this.recommendIllustsPage > 0) {
            $state.complete();
          }
          let quality =
            this.$store.getters["Settings/get"]("recommend.quality");
          this.recommendIllusts = this.Lodash.uniqBy(
            this.recommendIllusts.concat(
              adaptIllusts(response.data.illusts).filter((item) => {
                return item.statistic.bookmarks >= quality;
              })
            ),
            "id"
          );
          this.recommendIllustsPage += 1;
          $state.loaded();
          this.$store.commit("Cache/cacheState", {
            key: {
              type: "recommendIllust",
              id: this.id,
            },
            val: {
              page: this.recommendIllustsPage,
              illusts: this.recommendIllusts,
            },
          });
        })
        .catch((error) => {
          this.error(error.message);
          $state.error();
        });
    }, 1500),
    searchtag(name) {
      this.$router.push({
        name: "Search",
        query: { keyword: name, mode: "tag" },
      });
    },
    saveDirect() {
      if (this.illust.type == 2) {
        this.$store.commit("Pic/newDownloadTask", {
          id: this.id,
          page: -1,
          type: "ugoira",
          ugoiraFrames: this.ugoiraFrames,
          image: this.illust.image,
          name: this.$store.getters["Settings/get"]("download.filename").format(
            { id: this.id, page: 0, title: this.illust.title }
          ),
        });
      } else {
        let page = this.$refs.present.CurrentPage - 1;
        this.$store.commit("Pic/newDownloadTask", {
          id: this.id,
          page: page,
          type: "illust",
          image: this.illust.image,
          name: this.$store.getters["Settings/get"]("download.filename").format(
            { id: this.id, page: page, title: this.illust.title }
          ),
        });
      }
      this.$buefy.notification.open({
        message: this.getDownloadMessage(),
        type: "is-success",
        duration: 3000,
      });
    },
    updateImageLoading(progress) {
      this.imgprogress = progress * 100;
    },
    triggerForceFetchIllust() {
      this.illust = null;
      this.load(true);
    },
    saveDirectAll() {
      for (let page = 0; page < this.illust.pageCount; page++) {
        this.$store.commit("Pic/newDownloadTask", {
          id: this.id,
          page: page,
          type: "illust",
          image: this.illust.image,
          name: this.$store.getters["Settings/get"]("download.filename").format(
            { id: this.id, page: page, title: this.illust.title }
          ),
        });
      }
      this.$buefy.notification.open({
        message: this.getDownloadMessage(),
        type: "is-success",
        duration: 3000,
      });
    },
  },
  filters: {
    htmlFilter: function (val) {
      return val.replace(/<br \/?>/g, "\r\n").replace(/<.*?>/g, "");
    },
  },
  computed: {
    pageCount() {
      if (this.illust.type == 2) {
        return -1;
      }
      return this.illust.pageCount;
    },
    isIllustShow() {
      return isItemShow(this.illust);
    },
  },
};
</script>

<style lang="scss">
.ill_hide_tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.expand-tag-button {
  height: 1.25rem !important;

  margin: {
    left: 0.3rem;
  }
}

.statistic {
  margin: {
    top: 14px;
  }
  font-size: small;
  .statistic-item {
    display: inline-block;
    margin-right: 8px;
  }
}

.img-progress {
  margin-top: 1rem;
  transition: background 0.5s ease-out;
}

@media screen and (max-width: 790px) {
  .section {
    padding: 0;
  }

  .no-padding-phone {
    padding: 0 !important;
  }

  .top-padding-phone {
    padding-top: 1.5rem;
  }

  .columns {
    margin: auto !important;
  }
}

@media screen and (min-width: 790px) {
  .no-padding-comp {
    padding: 0 !important;
  }

  .img-info {
    position: sticky;
    top: 2rem;
  }
}

.section {
  padding-top: 2rem;
}

.no-bottom-margin {
  margin-bottom: 0 !important;
}

.little-top-margin {
  margin-top: 1rem !important;
}

.huge-top-margin {
  margin-top: 5rem;
}

.is-vertical-centered {
  align-items: center !important;
}

.obj-cover {
  object-fit: cover;
}

.like-container {
  width: 38px;
  height: 38px;
  padding: 7px;
  margin-bottom: 0.5rem;
  background: #fff;
  border-radius: 10px;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
</style>
