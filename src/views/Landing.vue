<template>
  <section>
    <b-navbar class="landing-navbar">
      <template #brand>
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <img src="../assets/images/favicon.png" />
        </b-navbar-item>
        <div class="title-container">
          <h3 class="title is-3">Pxelk</h3>
        </div>
      </template>
      <template #end>
        <b-navbar-item tag="div">
          <b-autocomplete
            rounded
            v-model="searchKeyword"
            :data="searchSuggestList"
            placeholder="试着输入些内容吧.."
            icon="uil-search"
            icon-pack="uil"
            @typing="suggestdebu"
            @keyup.enter.native="search()"
            @select="search"
            open-on-focus
          >
            <template #empty>No results found</template>
          </b-autocomplete>
        </b-navbar-item>
        <!-- <template v-if="isLoggedIn">
          <b-navbar-item
            class="hide-on-computer has-text-centered"
            @click="$router.push({ name: 'Account' })"
          >
            <b-tag>{{ userInfo.username }}</b-tag> 账号
          </b-navbar-item>
        </template>
        <template v-else>
          <b-navbar-item
            class="hide-on-computer has-text-centered"
            @click="showLoginPanel = true"
          >
            登录或者注册
          </b-navbar-item>
        </template> -->
        <!-- <b-navbar-item tag="div" class="hide-on-phone">
          <b-dropdown aria-role="list" position="is-bottom-left">
            <template #trigger>
              <p class="image is-64x64" role="button">
                <img
                  :src="isLoggedIn ? userAvatar : defaultAvatar"
                  class="user-ava is-rounded"
                />
              </p>
            </template>
            <template v-if="isLoggedIn">
              <div class="dropdown-item">
                <b-tag>{{ userInfo.username }}</b-tag>
              </div>
              <b-dropdown-item @click="$router.push({ name: 'Account' })"
                >账号</b-dropdown-item
              >
              <b-dropdown-item
                @click="$router.push({ name: 'Account', hash: '#3' })"
                >收藏</b-dropdown-item
              >
              <b-dropdown-item
                @click="$router.push({ name: 'Account', hash: '#4' })"
                >关注</b-dropdown-item
              >
              <b-dropdown-item @click="deleteToken">退出登录</b-dropdown-item>
            </template>
            <template v-else>
              <div class="dropdown-item"><b-tag>游客身份</b-tag></div>
              <b-dropdown-item @click="showLoginPanel = true"
                >登录或者注册</b-dropdown-item
              >
            </template>
          </b-dropdown>
        </b-navbar-item> -->
      </template>
    </b-navbar>
    <div class="full-screen">
      <div
        class="background"
        :style="{ 'background-image': `url(${backgroundImg})` }"
      ></div>
      <img class="logo" src="../assets/images/logo_text.png" />
    </div>
    <div class="container landing-info">
      <div class="columns">
        <div class="column is-two-thirds">
          <div class="notification">
            <h2>排行榜</h2>
            <HScroll
              :illusts="rankIllusts"
              @load="loadRankIllusts"
              :has-load="rankIllustsContinue"
              ref="userIllusts"
            ></HScroll>
          </div>
        </div>
        <div class="column">
          <div class="notification">
            <h2>推荐画师</h2>
            <UserList
              :users="sampleUsers"
              :has-load="sampleUsersLoadFlag"
              @load="loadSampleUsers"
            ></UserList>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <WaterFall :illusts="sampleIllusts" :identifier="loadid" />
      <infinite-loading
        @infinite="sampleIllustsPageNext"
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
          </div>
        </div>
      </infinite-loading>
    </div>

    <!-- <b-modal
      :active="showLoginPanel"
      has-modal-card
      trap-focus
      :destroy-on-hide="true"
      aria-modal
    >
      <template>
        <Login @close="showLoginPanel = false"></Login>
      </template>
    </b-modal> -->
  </section>
</template>

<script>
import CONFIG from "@/config";
import WaterFall from "@/components/waterfall";
import HScroll from "@/components/horizontal_scroll";
import UserList from "@/components/user_list";
// import Login from "@/components/login";
import { getUserInfo, isLoggedIn, deleteToken } from "@/utils/account";
import md5 from "@/utils/md5";
import { adaptIllusts, adaptSampleUser } from "@/utils/adapter";

export default {
  name: "Landing",
  components: {
    WaterFall,
    HScroll,
    UserList,
    // Login,
  },
  data() {
    return {
      backgroundImg: CONFIG.RAND_IMG,
      defaultAvatar: "https://bucket.nekonya.fun/others/pixivel/defaultAva.jpg",
      sampleIllusts: [],
      sampleIllustsPage: 0,
      loadid: +new Date(),
      rankIllustsContinue: true,
      rankIllusts: [],
      rankIllustsPage: 0,
      searchKeyword: "",
      suggestdebu: null,
      searchSuggestList: [],
      sampleUsers: [],
      sampleUsersPage: 0,
      sampleUsersLoadFlag: true,
      showLoginPanel: false,
    };
  },
  created() {
    this.suggestdebu = this.Lodash.debounce(() => {
      if (this.searchKeyword != "") {
        this.axios
          .get(
            CONFIG.API_HOST + `search_autocomplete?word=${this.searchKeyword}`
          )
          .then((response) => {
            if (response.data.error) {
              this.error(response.data.error.user_message);
              return;
            }
            this.searchSuggestList = response.data.tags.map((e) => e.name);
          })
          .catch((error) => {
            this.error(error.message);
          });
      }
    }, 1000);
  },
  mounted() {},
  computed: {
    isLoggedIn() {
      return isLoggedIn();
    },
    userInfo() {
      return getUserInfo();
    },
    userAvatar() {
      return CONFIG.GRAVATAR_PROXY + md5(this.userInfo.email);
    },
  },
  methods: {
    onDeveloping() {
      this.$buefy.notification.open({
        duration: 5000,
        message: "功能正在开发...",
        type: "is-info",
      });
    },
    deleteToken() {
      this.$buefy.dialog.confirm({
        title: "退出登录",
        message: `确定要退出登录?<br>退出登录后本地将无法访问你的关注和收藏数据，需要重新登录。`,
        cancelText: "返回",
        confirmText: "确定",
        type: "is-success",
        onConfirm: () => {
          deleteToken();
          this.$router.go(0);
        },
      });
    },
    sampleIllustsPageNext($state) {
      let params = {
        // p: this.sampleIllustsPage,
        include_ranking_illusts: false,
        include_privacy_policy: false,
      };
      this.axios
        .get(CONFIG.API_HOST + `illust_recommended`, {
          params,
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            $state.error();
            return;
          }
          let sanity = this.$store.getters["Settings/get"](
            "sample.sanity_filter"
          );
          this.sampleIllusts = this.sampleIllusts.concat(
            this.Lodash.shuffle(
              adaptIllusts(response.data.illusts).filter((item) => {
                return item.aiType != 2 && item.sanity < sanity;
              })
            )
          );
          // if (this.sampleIllustsPage >= 20) {
          //   $state.complete();
          //   return;
          // }
          $state.complete();
          $state.loaded();
          // this.sampleIllustsPage += 1;
        })
        .catch((error) => {
          this.error(error.message);
          $state.error();
        });
    },
    loadSampleUsers() {
      let params = {
        // p: this.sampleUsersPage,
      };
      this.axios
        .get(CONFIG.API_HOST + `user_recommended`, {
          params,
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            return;
          }
          this.sampleUsers = this.sampleUsers.concat(
            response.data.user_previews
              .filter((e) => e.illusts.length > 0)
              .sort(
                (a, b) =>
                  b.illusts[0].total_bookmarks - a.illusts[0].total_bookmarks
              )
              .map(adaptSampleUser)
          );
          this.sampleUsersLoadFlag = false;
          // if (this.sampleIllustsPage >= 20) {
          //   this.sampleUsersLoadFlag = false;
          //   return;
          // }
          // this.sampleUsersPage += 1;
        })
        .catch((error) => {
          this.error(error.message);
        });
    },
    search(keywd) {
      let key = "";
      if (this.searchKeyword != "") {
        key = this.searchKeyword;
      } else if (keywd) {
        key = keywd;
      }
      if (key != "") {
        if (/^[\d]+$/.test(key)) {
          this.$buefy.dialog.confirm({
            title: "跳转ID",
            message: "检测到ID输入，将会跳转到对应的插画或画师界面，请选择",
            confirmText: "输入的是插画ID",
            cancelText: "输入的是画师ID",
            onCancel: () => {
              this.$router.push({ name: "User", params: { id: key } });
            },
            onConfirm: () => {
              this.$router.push({ name: "Detail", params: { id: key } });
            },
          });
          return;
        }
        this.$router.push({
          name: "Search",
          query: { keyword: key, mode: "illust" },
        });
      }
    },
    loadRankIllusts() {
      let params = {
        mode: "day",
        // content: "all",
        date: this.moment().subtract(2, "days").format("YYYY-MM-DD"),
        page: this.rankIllustsPage + 1,
      };
      this.axios
        .get(CONFIG.API_HOST + `rank`, {
          params,
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            return;
          }
          // if (!response.data.next_url) {
          this.rankIllustsContinue = false;
          // }
          this.rankIllusts = this.rankIllusts.concat(
            adaptIllusts(response.data.illusts)
          );
          // this.rankIllustsPage += 1;
        })
        .catch((error) => {
          this.error(error.message);
        });
    },
    error(message) {
      this.$buefy.notification.open({
        duration: 5000,
        message: message,
        type: "is-danger",
      });
    },
  },
};
</script>

<style lang="scss">
.container {
  padding-bottom: 20px;
}

.user-ava {
  object-fit: cover;
  width: 100%;
  height: 100% !important;
  margin: 0 !important;
  max-height: 100% !important;
  padding: 8px;
  transition: transform 0.7s ease-in-out;

  &:hover {
    transform: rotate(360deg);
  }
}

.full-screen {
  .logo {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
    width: auto;
    height: auto;
    object-position: center;
    @media screen and (max-width: 975px) {
      object-fit: contain;
    }
    object-fit: cover;
    filter: brightness(1.03);
    opacity: 0;
    animation: toshow 0.5s ease-out forwards;
  }

  @keyframes toshow {
    to {
      opacity: 1;
    }
  }

  .background {
    position: relative;
    height: calc(100vh + 6rem);

    background: {
      attachment: scroll;
      repeat: no-repeat;
      position: 50%;
      size: cover;
    }

    &:before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 0;

      background: {
        attachment: fixed;
        image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAADAQMAAACDJEzCAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAGUExURQAAAEdwTIDnVscAAAACdFJOUzMAgvioCAAAAA5JREFUCNdjOMBwgIEBAAYGAYE538a8AAAAAElFTkSuQmCC);
      }

      background-color: rgba(255, 255, 255, 0.5);
    }
  }
}

.landing-info {
  padding: {
    left: 0.75rem;
    right: 0.75rem;
  }
  margin: {
    top: -2rem;
    bottom: 2rem;
  }
  .userlist {
    height: 187px;
  }
  .notification {
    padding: {
      top: 1.25rem;
      bottom: 1.25rem;
      left: 1.5rem;
      right: 1.5rem;
    }
  }
}

.landing-navbar {
  position: absolute;
  top: 0;
  width: 100%;
  height: 4rem;
  z-index: 40;
  background: transparent;
  img {
    margin-left: 7px;
    max-height: 3rem;
  }
  input {
    box-shadow: none !important;
    border: none;
    background: rgba(255, 255, 255, 0.3) !important;
    min-width: 20rem;
    color: #2f2f2f;
  }
  .title-container {
    display: flex;
    align-items: center;
    .title {
      color: #ffffff;
    }
  }
  .icon {
    color: #4a4a4a !important;
  }
}
</style>
