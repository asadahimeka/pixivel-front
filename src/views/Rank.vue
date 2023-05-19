<template>
  <section class="default-full-screen-top">
    <div class="container rank-form">
      <b-field>
        <!--"daily", "weekly", "monthly", "rookie", "original", "male", "female"-->
        <p class="control hide-c">
          <b-dropdown v-model="mode">
            <template #trigger>
              <b-button
                :label="rankLable[mode]"
                :type="'is-' + rankType[mode]"
                :icon-left="'uil uil-' + rankIcon[mode]"
                icon-right="uil uil-angle-down"
              />
            </template>
            <b-dropdown-item
              :value="val"
              v-for="val in rankContentModes[content]"
              :key="val"
            >
              <b-icon pack="uil" :icon="'uil-' + rankIcon[val]"></b-icon>
              <span>{{ rankLable[val] }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </p>
        <b-radio-button
          v-model="mode"
          :native-value="val"
          :type="'is-' + rankType[val] + ' is-light is-outlined'"
          v-for="(val, index) in rankContentModes[content]"
          :key="val"
          class="hide-p"
          :class="{ 'left-border-radius': index == 0 }"
        >
          <b-icon pack="uil" :icon="'uil-' + rankIcon[val]"></b-icon>
          <span>{{ rankLable[val] }}</span>
        </b-radio-button>
        <b-datepicker
          v-model="date"
          placeholder="输入或选择一个日期："
          icon-prev="uil uil-previous"
          icon-next="uil uil-step-forward"
          icon-right="uil uil-calender"
          :max-date="moment().subtract(2, 'days')._d"
          editable
        >
        </b-datepicker>
        <!-- <p class="control">
          <b-dropdown v-model="content">
            <template #trigger>
              <b-button
                :label="rankContent[content]"
                type="'is-light"
                icon-right="uil uil-angle-double-down"
              />
            </template>
            <b-dropdown-item
              :value="val"
              v-for="(item, val) in rankContent"
              :key="val"
            >
              <span>{{ item }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </p> -->
      </b-field>
    </div>
    <div class="container">
      <WaterFall :illusts="illustsn" :identifier="loadid" />
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
    </div>
  </section>
</template>

<script>
import Lodash from "lodash";
import CONFIG from "@/config";
import WaterFall from "@/components/waterfall";
import { adaptIllusts } from "@/utils/adapter";

export default {
  name: "Rank",
  components: {
    WaterFall,
  },
  data() {
    return {
      mode: "day",
      content: "all",
      date: this.moment().subtract(2, "days")._d,
      errorMsg: "",
      illusts: [],
      loadid: +new Date(),
      illustsPage: 0,
      rankLable: {
        day: "日榜",
        week: "周榜",
        month: "月榜",
        week_rookie: "新人",
        week_original: "原创",
        day_male: "男榜",
        day_female: "女榜",
      },
      rankType: {
        day: "primary",
        week: "success",
        month: "link",
        week_rookie: "info",
        week_original: "info",
        day_male: "warning",
        day_female: "warning",
      },
      rankIcon: {
        day: "sun",
        week: "calendar-alt",
        month: "moon",
        week_rookie: "newspaper",
        week_original: "images",
        day_male: "mars",
        day_female: "venus",
      },
      rankContent: {
        all: "所有类型",
        illust: "仅插画",
        manga: "仅漫画",
        ugoira: "仅动图",
      },
      rankContentModes: {
        all: [
          "day",
          "week",
          "month",
          "week_rookie",
          "week_original",
          "day_male",
          "day_female",
        ],
        illust: ["daily", "weekly", "monthly", "rookie"],
        manga: ["daily", "weekly", "monthly", "rookie"],
        ugoira: ["daily", "weekly"],
      },
    };
  },
  watch: {
    mode(v) {
      console.log("watch mode: ", v);
      this.refresh();
      this.$router
        .push({
          name: "Rank",
          query: { mode: this.mode /* , content: this.content */ },
        })
        .catch(() => {});
    },
    // content(v) {
    //   console.log("watch content: ", v);
    //   this.mode = "day";
    //   this.refresh();
    //   this.$router.push({
    //     name: "Rank",
    //     query: { mode: this.mode, content: this.content },
    //   });
    // },
    date() {
      this.refresh();
    },
    $route() {
      if (this.$route.name != "Rank") return;
      this.mode = this.$route.query.mode || "day";
      // this.content = this.$route.query.content;
    },
  },
  mounted() {
    console.log("mounted: ");
    setTimeout(() => {
      this.$refs.infload.$emit("$InfiniteLoading:reset");
      this.$refs.infload.attemptLoad();
    }, 1500);
  },
  created() {
    this.mode = this.$route.query.mode || "day";
    // this.content = this.$route.query.content;
    // if (!this.mode) this.mode = "day";
    // if (!this.content) this.content = "all";
  },
  methods: {
    refresh() {
      console.log("refresh: ");
      this.illusts = [];
      this.loadid += 1;
      this.errorMsg = "";
      this.illustsPage = 0;
      this.$store.commit("CancelRequests/clearCancelToken");
      setTimeout(() => {
        this.$refs.infload.$emit("$InfiniteLoading:reset");
        this.$refs.infload.attemptLoad();
      }, 1500);
    },
    illustsPageNext: Lodash.throttle(function ($state) {
      let params = {
        mode: this.mode,
        // content: this.content,
        date: this.moment(this.date).format("YYYY-MM-DD"),
        page: this.illustsPage + 1,
      };
      this.axios
        .get(CONFIG.API_HOST + `rank`, {
          params,
        })
        .then((response) => {
          if (response.data.error) {
            this.error(response.data.error.user_message);
            $state.error();
            return;
          }
          if (!response.data.next_url) {
            $state.complete();
          }
          this.illusts = this.illusts.concat(
            adaptIllusts(response.data.illusts)
          );
          this.illustsPage += 1;
          $state.loaded();
        })
        .catch((error) => {
          if (error?.response?.data) {
            this.error(error?.response?.data?.message);
          }
          $state.error();
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
  computed: {
    illustsn() {
      return this.illusts.filter((v) => {
        return v.id != 0;
      });
    },
  },
};
</script>

<style lang="scss">
.rank-form {
  padding: {
    top: 2rem;
    bottom: 2rem;
    left: 0.75rem;
    right: 0.75rem;
  }

  .left-border-radius {
    .button {
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
    }
  }

  .datepicker {
    width: stretch;
  }

  @media screen and (max-width: 790px) {
    .hide-p {
      display: none;
    }
  }

  @media screen and (min-width: 790px) {
    .hide-c {
      display: none;
    }
  }
}
</style>
