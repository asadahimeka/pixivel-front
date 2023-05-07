<template>
  <section class="default-full-screen-top">
    <div class="container search-form">
      <b-field>
        <p class="control">
          <b-dropdown v-model="mode">
            <template #trigger>
              <b-button
                :label="{ illust: '插画', tag: '标签', user: '作者' }[mode]"
                type="is-success"
                icon-right="uil uil-angle-down"
              />
            </template>
            <b-dropdown-item value="illust"> 插画 </b-dropdown-item>
            <!-- <b-dropdown-item value="tag"> 标签搜索插画 </b-dropdown-item> -->
            <b-dropdown-item value="user"> 作者 </b-dropdown-item>
          </b-dropdown>
        </p>
        <p v-if="mode != 'user'" class="control">
          <b-dropdown v-model="usersIriTag">
            <template #trigger>
              <b-button
                :label="usersIriTag || 'users入り'"
                icon-right="uil uil-angle-down"
              />
            </template>
            <b-dropdown-item
              v-for="t in usersIriTags"
              :key="t.text"
              :value="t.value"
            >
              {{ t.text }}
            </b-dropdown-item>
          </b-dropdown>
        </p>
        <b-taginput
          v-model="tags"
          :data="suggestList"
          autocomplete
          :allow-new="true"
          icon="uil-label"
          icon-pack="uil"
          @typing="suggestdebu"
          placeholder="输入标签 半角逗号来添加"
          @keyup.enter.native="search()"
          v-if="mode == 'tag'"
        >
        </b-taginput>
        <b-autocomplete
          v-else
          v-model="keyword"
          :data="suggestList"
          placeholder="试着输入些内容吧.."
          @select="searchonselect"
          icon="uil-search"
          icon-pack="uil"
          @typing="suggestdebu"
          @keyup.enter.native="search()"
          open-on-focus
        >
          <template #empty>No results found</template>
        </b-autocomplete>
        <p class="control">
          <b-button class="button is-info" @click="search()">搜索</b-button>
        </p>
      </b-field>
      <!-- <b-field v-if="mode == 'illust' || mode == 'tag'">
        <b-checkbox-button
          v-model="queryFeatures"
          native-value="sortpop"
          type="is-danger"
          size="is-small"
        >
          <b-icon
            pack="uil"
            icon="uil-sort-amount-down"
            size="is-small"
          ></b-icon>
          <span>热门度排序</span>
        </b-checkbox-button>
        <b-checkbox-button
          v-model="queryFeatures"
          native-value="sortdate"
          type="is-success"
          size="is-small"
        >
          <b-icon pack="uil" icon="uil-clock" size="is-small"></b-icon>
          <span>时间排序</span>
        </b-checkbox-button>
      </b-field> -->
    </div>
    <section v-if="finalKeyword">
      <div class="container">
        <template v-if="mode == 'illust' || mode == 'tag'">
          <WaterFall :illusts="illusts" />
          <infinite-loading
            @infinite="illustsPageNext"
            spinner="spiral"
            :identifier="loadid"
            ref="infload"
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
                {{ errorMsg }}
              </div>
            </div>
          </infinite-loading>
        </template>
        <template v-else-if="mode == 'user'">
          <UserList
            :users="users"
            :has-load="usersLoad"
            @load="usersPageNext"
          ></UserList>
          <br />
        </template>
      </div>
    </section>
  </section>
</template>

<script>
import Lodash from "lodash";
import CONFIG from "@/config";
import WaterFall from "@/components/waterfall";
import UserList from "@/components/user_list";
import { adaptIllusts, adaptSampleUser, xSetting } from "@/utils/adapter";

export default {
  name: "Search",
  components: {
    WaterFall,
    UserList,
  },
  data: () => {
    return {
      keyword: "",
      finalKeyword: "",
      tags: [],
      suggestList: [],
      suggestdebu: null,
      errorMsg: "",
      mode: "illust",
      illustsPage: 0,
      illusts: [],
      users: [],
      usersLoad: true,
      loadid: +new Date(),
      queryFeatures: [],
      usersIriTag: "",
      usersIriTags: [
        { text: "users入り", value: "" },
        { text: "30000users入り", value: "30000users入り" },
        { text: "20000users入り", value: "20000users入り" },
        { text: "10000users入り", value: "10000users入り" },
        { text: "7500users入り", value: "7500users入り" },
        { text: "5000users入り", value: "5000users入り" },
        { text: "1000users入り", value: "1000users入り" },
        { text: "500users入り", value: "500users入り" },
        { text: "250users入り", value: "250users入り" },
        { text: "100users入り", value: "100users入り" },
      ],
    };
  },
  watch: {
    tags() {
      if (this.tags.length < 1) return;
      this.keyword = this.tags.join(",");
    },
    finalKeyword() {
      this.refresh(false);
    },
    usersIriTag() {
      this.refresh(false);
    },
    mode() {
      this.refresh(true);
      this.$router
        .push({
          name: "Search",
          query: {
            keyword: this.keyword,
            mode: this.mode,
            features: this.queryFeatures?.join(","),
          },
        })
        .catch(() => {});
    },
    queryFeatures() {
      this.refresh(false);
      this.$router
        .push({
          name: "Search",
          query: {
            keyword: this.keyword,
            mode: this.mode,
            features: this.queryFeatures.filter((n) => n).join(","),
          },
        })
        .catch(() => {});
    },
    $route() {
      this.keyword = this.$route.query.keyword;
      this.finalKeyword = this.$route.query.keyword;
      this.mode = this.$route.query.mode;
      this.queryFeatures = this.$route.query.features?.split(",") || [];
      if (!this.mode) this.mode = "illust";
      if (this.mode == "tag") this.tags = this.keyword.split(",");
    },
  },
  created() {
    this.mode = this.$route.query.mode;
    if (!this.mode) this.mode = "illust";
    this.keyword = this.$route.query.keyword;
    this.finalKeyword = this.$route.query.keyword;
    this.queryFeatures = this.$route.query.features?.split(",") || [];
    if (this.mode == "tag") this.tags = this.keyword.split(",");
    this.suggestdebu = this.Lodash.debounce(() => {
      if (this.keyword != "") {
        this.suggest();
      }
    }, 800);
  },
  mounted() {
    if (this.finalKeyword) {
      setTimeout(() => {
        if (this.$refs.infload) {
          this.$refs.infload.$emit("$InfiniteLoading:reset");
          this.$refs.infload.attemptLoad();
        }
      }, 1500);
    }
  },
  methods: {
    refresh(total = false) {
      this.illusts = [];
      this.users = [];
      this.usersLoad = true;
      this.illustsPage = 0;
      this.errorMsg = "";
      this.suggestList = [];
      this.loadid += 1;
      if (total) {
        this.finalKeyword = this.$route.query.keyword;
        this.keyword = this.$route.query.keyword;
        this.queryFeatures = this.$route.query.features?.split(",") || [];
      }
      this.$store.commit("CancelRequests/clearCancelToken");
    },
    searchonselect(keywd) {
      if (keywd) {
        this.$router
          .push({
            name: "Search",
            query: {
              keyword: keywd,
              mode: this.mode,
              features: this.queryFeatures?.join(","),
            },
          })
          .catch(() => {});
      }
    },
    search() {
      if (this.keyword != this.$route.query.keyword) {
        this.$router
          .push({
            name: "Search",
            query: {
              keyword: this.keyword,
              mode: this.mode,
              features: this.queryFeatures.join(","),
            },
          })
          .catch(() => {});
      }
    },
    suggest() {
      if (this.mode == "illust") {
        this.axios
          .get(CONFIG.API_HOST + `search_autocomplete?word=${this.keyword}`)
          .then((response) => {
            if (response.data.error) {
              this.error(response.data.error.user_message);
              return;
            }
            this.suggestList = response.data.tags.map((e) => e.name);
          })
          .catch((error) => {
            this.error(error.message);
          });
      } else if (this.mode == "tag") {
        this.axios
          .get(CONFIG.API_HOST + `search_autocomplete?word=${this.keyword}`)
          .then((response) => {
            if (response.data.error) {
              this.error(response.data.error.user_message);
              return;
            }
            this.suggestList = response.data.tags.map((e) => e.name);
          })
          .catch((error) => {
            this.error(error.message);
          });
      } else if (this.mode == "user") {
        this.suggestList = [];
        // this.axios
        //   .get(CONFIG.API_HOST + `user/search/${this.keyword}/suggest`)
        //   .then((response) => {
        //     if (response.data.error) {
        //       this.error(response.data.message);
        //       return;
        //     }
        //     this.suggestList = response.data.data.suggest_words;
        //   })
        //   .catch((error) => {
        //     this.error(error.message);
        //   });
      }
    },
    illustsPageNext: Lodash.throttle(function ($state) {
      // if (this.mode == "illust") {
      let keyword = this.finalKeyword;
      if (this.usersIriTag) keyword += " " + this.usersIriTag;
      if (!(xSetting.r18 || xSetting.r18g)) keyword += " -R-18 -R18 -18+";
      if (!xSetting.ai) keyword += " -AI";

      let params = {
        word: keyword,
        page: this.illustsPage + 1,
        // sortpop: this.queryFeatures.includes("sortpop"),
        // sortdate: this.queryFeatures.includes("sortdate"),
      };
      this.axios
        .get(CONFIG.API_HOST + `search`, {
          params,
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            $state.error();
            return;
          }
          if (this.illustsPage > 8 || !response.data.next_url) {
            $state.complete();
          }
          let { illusts } = response.data;
          if (this.usersIriTag) {
            illusts = illusts.filter((e) => {
              return e.total_bookmarks > parseInt(this.usersIriTag);
            });
          }
          this.illusts = this.Lodash.uniqBy(
            this.illusts.concat(adaptIllusts(illusts)),
            "id"
          );
          this.illustsPage += 1;
          $state.loaded();
        })
        .catch((error) => {
          this.error(error.message);
        });
      // } else if (this.mode == "tag") {
      //   let params = {
      //     page: this.illustsPage,
      //     sortpop: this.queryFeatures.includes("sortpop"),
      //     sortdate: this.queryFeatures.includes("sortdate"),
      //   };
      //   let keyword = this.finalKeyword;
      //   this.axios
      //     .get(CONFIG.API_HOST + `tag/search/${keyword}`, {
      //       params,
      //     })
      //     .then((response) => {
      //       if (response.data.error) {
      //         this.error(response.data.message);
      //         $state.error();
      //         return;
      //       }
      //       if (!response.data.data.has_next) {
      //         $state.complete();
      //       }
      //       this.illusts = this.illusts.concat(response.data.data.illusts);
      //       this.illustsPage += 1;
      //       $state.loaded();
      //     })
      //     .catch((error) => {
      //       this.error(error.message);
      //     });
      // }
    }, 1500),
    usersPageNext: Lodash.throttle(function () {
      let params = {
        page: this.illustsPage + 1,
      };
      let keyword = this.finalKeyword;
      this.axios
        .get(CONFIG.API_HOST + `search_user?word=${keyword}`, {
          params,
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            this.usersLoad = false;
            return;
          }
          if (this.illustsPage > 5 || !response.data.next_url) {
            this.usersLoad = false;
          }
          this.users = this.Lodash.uniqBy(
            this.users.concat(response.data.user_previews.map(adaptSampleUser)),
            "id"
          );
          this.illustsPage += 1;
        })
        .catch((error) => {
          console.error("error: ", error);
          this.error(error.message);
        });
    }, 1500),
    error(message) {
      this.$buefy.notification.open({
        duration: 5000,
        message: message,
        type: "is-danger",
      });
      this.errorMsg = message;
    },
  },
};
</script>

<style lang="scss">
.search-form {
  padding: {
    top: 2rem;
    bottom: 2rem;
    left: 0.75rem;
    right: 0.75rem;
  }
  .field {
    min-width: 20rem;
    .autocomplete {
      flex: 1;
    }
    .taginput {
      flex: 1;
    }
  }
  //min-width: 30rem;
}
</style>
