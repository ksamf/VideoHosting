import { api } from "./client";

export const getUserById = async (userId) => {
    const res = await api(`/user/${userId}`);
    return res;
};

export const getUserByVideoId = async (id) => {
    const res = await api(`/user/video/${id}`);
    return res
};

export const subUnsubChannel = async (channelId, action) => {
    const res = await api(`/user/channel/${channelId}?action=${action}`,
        { method: "POST",}
    );
    return res
}

export const getUserSubscriptionsCount = async (channelId, period=0) => {
    const res = await api(`/channel/${channelId}/subcount?period=${period}`);
    return res
}
export const getUserSubscribed = async (channelId) => {
    const res = await api(`/channel/${channelId}/subscribed`);
    return res
}
export const getUserSubscriptions = async (userId) => {
    const res = await api(`/user/${userId}/sub`);
    return res
}

export const getUserWatchedVideo = async(userId)=>{
    const res = await api(`/user/${userId}/watched`)
    return res
}

export const getUserLikedVideo = async(userId)=>{
    const res = await api(`/user/${userId}/liked`)
    return res
}

export const getUserVideos = async(userId)=>{
    const res =  await api(`/user/${userId}/video`)
    return res
}

export const getUserViewsCount = async (channelId, period=0) => {
    const res = await api(`/channel/${channelId}/views?period=${period}`);
    return res
}

export const uploadUserAvatar = async (userId, file) => {
    const form = new FormData();
    form.append("avatar", file);
    const res = await api(`/user/${userId}/upload`, { method: "POST", body: form });
    return res;
};

export const getUserSubscriptionsVideo = async (userId) => {
    const res = await api(`/user/${userId}/sub/video`);
    return res
}

export const getUserRecommendations = async (userId, limit = 20, offset = 0) => {
  const res = await api(`/user/${userId}/recommendations?limit=${limit}&offset=${offset}`);
  return res
};
