import { api, unwrapApi } from "./client";
import type {
    ChannelActionResponse,
    IsSubscribedResponse,
    SubscriptionsCountResponse,
    UploadAvatarResponse,
    ViewsCountResponse,
} from "../types/responses/users";
import type { PaginatedQuery } from "../types/api";
import type { Video, VideosResponse } from "../types/video";
import type { User } from "../types/user";

export const getUserById = async (userId: string): Promise<User> => {
    return unwrapApi(await api<User>(`/user/${userId}`));
};

export const getUserByVideoId = async (id: string): Promise<User> => {
    return unwrapApi(await api<User>(`/user/video/${id}`));
};

export const searchChannels = async (params: { q: string, limit: number, offset: number }): Promise<User[]> => {
    return unwrapApi(await api<User[]>(
        "/search/channels?" + new URLSearchParams({
            q: params.q,
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
};

export const subUnsubChannel = async (channelId: string, action: "sub" | "unsub"): Promise<ChannelActionResponse> => {
    const query = new URLSearchParams({ action });
    return unwrapApi(await api<ChannelActionResponse>(`/user/channel/${channelId}?${query.toString()}`,
        { method: "POST", }
    ));
}

export const getUserSubscriptionsCount = async (channelId: string, period: number = 0): Promise<SubscriptionsCountResponse> => {
    return unwrapApi(await api<SubscriptionsCountResponse>(`/channel/${channelId}/subcount?period=${period}`));
}
export const getUserSubscribed = async (channelId: string): Promise<IsSubscribedResponse> => {
    return unwrapApi(await api<IsSubscribedResponse>(`/channel/${channelId}/subscribed`));
}
export const getUserSubscriptions = async (userId: string): Promise<User[]> => {
    return unwrapApi(await api<User[]>(`/user/${userId}/sub`));
}

export const getUserWatchedVideo = async (
    userId: string,
    params: PaginatedQuery = { limit: 20, offset: 0 },
): Promise<VideosResponse> => {
    return unwrapApi(await api<VideosResponse>(
        `/user/${userId}/watched?` + new URLSearchParams({
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
}

export const getUserLikedVideo = async (
    userId: string,
    params: PaginatedQuery = { limit: 20, offset: 0 },
): Promise<VideosResponse> => {
    return unwrapApi(await api<VideosResponse>(
        `/user/${userId}/liked?` + new URLSearchParams({
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
}

export const getUserVideos = async (userId: string): Promise<VideosResponse> => {
    return unwrapApi(await api<VideosResponse>(`/user/${userId}/video`));
}

export const getUserViewsCount = async (channelId: string, period: number = 0): Promise<ViewsCountResponse> => {
    return unwrapApi(await api<ViewsCountResponse>(`/channel/${channelId}/views?period=${period}`));
}

export const uploadUserAvatar = async (userId: string, file: File): Promise<UploadAvatarResponse> => {
    const form = new FormData();
    form.append("avatar", file);
    form.append("public_content_consent", "true");
    return unwrapApi(await api<UploadAvatarResponse>(`/user/${userId}/upload`, { method: "POST", body: form }));
};

export const getUserSubscriptionsVideo = async (
    userId: string,
    params: PaginatedQuery = { limit: 20, offset: 0 },
): Promise<VideosResponse> => {
    return unwrapApi(await api<VideosResponse>(
        `/user/${userId}/sub/video?` + new URLSearchParams({
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
}

export const getUserRecommendations = async (userId: string, limit: number = 20, offset: number = 0): Promise<Video[]> => {
    const params: PaginatedQuery = { limit, offset };
    return unwrapApi(await api<Video[]>(
        `/user/${userId}/recommendations?` + new URLSearchParams({
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
};
