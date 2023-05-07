import storage from "store2";

export const xSetting = storage.get("P_XSetting", {
  r18: false,
  r18g: false,
  ai: false,
});

export function isItemShow(item) {
  if (item.xRestrict == 1) {
    if (item.aiType == 2) {
      return xSetting.r18 && xSetting.ai;
    }
    return xSetting.r18;
  }
  if (item.xRestrict == 2) {
    if (item.aiType == 2) {
      return xSetting.r18g && xSetting.ai;
    }
    return xSetting.r18g;
  }
  if (item.aiType == 2) {
    return xSetting.ai;
  }
  return true;
}

export async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function adaptIllusts(arr) {
  return arr.map(adaptIllust);
}

export function adaptIllust(d) {
  const dateMatched = d.image_urls.medium.match(
    /(\d{4}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d{2})/
  );
  return {
    aiType: d.illust_ai_type,
    altTitle: "",
    createDate: d.create_date.slice(0, 19),
    description: d.caption,
    height: d.height,
    id: d.id,
    image: (dateMatched && dateMatched[1]) || d.create_date.slice(0, 19),
    pageCount: d.page_count,
    sanity: d.sanity_level,
    statistic: {
      bookmarks: d.total_bookmarks,
      comments: d.total_comments,
      likes: 0,
      views: d.total_view,
    },
    tags: d.tags,
    title: d.title,
    type: d.type == "ugoira" ? 2 : 1,
    uploadDate: d.create_date.slice(0, 19),
    user: {
      bio: "",
      id: d.user.id,
      image: {
        background: d.user.profile_image_urls.medium,
        bigUrl: d.user.profile_image_urls.medium,
        url: d.user.profile_image_urls.medium,
      },
      name: d.user.name,
    },
    width: d.width,
    xRestrict: d.x_restrict,
  };
}

export function adaptSampleUser(d) {
  return {
    bio: "",
    id: d.user.id,
    image: {
      bigUrl: d.user.profile_image_urls.medium,
      url: d.user.profile_image_urls.medium,
    },
    name: d.user.name,
  };
}

export function adaptUser(d) {
  return {
    bio: d.user.comment,
    id: d.user.id,
    image: {
      background: d.profile.background_image_url,
      bigUrl: d.user.profile_image_urls.medium,
      url: d.user.profile_image_urls.medium,
    },
    name: d.user.name,
  };
}
