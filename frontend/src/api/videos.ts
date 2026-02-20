import { PaginatedQuery } from "../types/api";
import { api, unwrapApi } from "./client";
import { Video, VideosResponse, UploadVideoResponse } from "../types/video";
import { Comment, AddComment, AddReaction, Reaction, UpdateViews } from "../types/action";

export const getVideos = async (params: PaginatedQuery): Promise<VideosResponse> => {
    return unwrapApi(await api<VideosResponse>(
        "/video?" + new URLSearchParams({
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
};

export const searchVideos = async (params: { q: string, limit: number, offset: number }): Promise<VideosResponse> => {
    return unwrapApi(await api<VideosResponse>(
        "/search?" + new URLSearchParams({
            q: params.q,
            limit: String(params.limit),
            offset: String(params.offset),
        }),
    ));
};

export const getVideoById = async (id: string): Promise<Video> => {
    return unwrapApi(await api<Video>(`/video/${id}`));
};

export const uploadVideo = async (form: FormData): Promise<UploadVideoResponse> => {
    return unwrapApi(await api<UploadVideoResponse>("/video/upload",
        { method: "POST", body: form }
    ));
};

export const getComments = async (id: string): Promise<Comment[]> => {
    return unwrapApi(await api<Comment[]>(`/video/${id}/comments`));
};

export const addComment = async (id: string, comment: string): Promise<AddComment> => {
    return unwrapApi(await api<AddComment>(`/video/${id}/comment`,
        { method: "POST", body: JSON.stringify({ comment }) }
    ));
}

export const addReaction = async (id: string, reaction: string): Promise<AddReaction> => {
    const query = new URLSearchParams();
    if (reaction) query.set("r", reaction);

    return unwrapApi(await api<AddReaction>(`/video/${id}/reaction` + (query.toString() ? `?${query.toString()}` : ""),
        { method: "POST", }
    ));
}

export const getReaction = async (id: string): Promise<Reaction> => {
    return unwrapApi(await api<Reaction>(`/video/${id}/reaction`));
}

export const updateVideoViews = async (videoId: string, deviceId: string, watchedSeconds: number): Promise<UpdateViews> => {
    const payload = {
        device_id: deviceId,
        watched_seconds: watchedSeconds,
    };
    return unwrapApi(await api<UpdateViews>(`/video/${videoId}/views`, { method: "POST", body: JSON.stringify(payload) }));
}
