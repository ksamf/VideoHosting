import { api } from "./client";

export const getVideos = async (params) => {
    const res = await api("/video?" + new URLSearchParams(params), );
    return res
};

export const searchVideos = async (params) => {
    const res = await api("/search?" + new URLSearchParams(params));
    return res
};

export const getVideoById = async (id) => {
    const res = await api(`/video/${id}`);
    return res
};

export const uploadVideo = async (form) => {
    const res = await api("/video/upload", 
        { method: "POST", body: form }
    );
    return res
};

export const getComments = async (id) => {
    const res = await api(`/video/${id}/comments`);
    return res
};

export const addComment = async (id, comment) => {
    const res = await api(`/video/${id}/comment`, 
        { method: "POST", body: JSON.stringify({ comment })}
    );
    return res
}

export const addReaction = async (id, reaction) => {
    const res = await api(`/video/${id}/reaction` + (reaction ? `?r=${reaction}` : ""), 
        { method: "POST",}
    );
    return res
}

export const getReaction = async (id) => {
    const res = await api(`/video/${id}/reaction`);
    return res
}

export const updateVideoViews = async (videoId, deviceId, watchedSeconds) => {
    const payload = {
        device_id: deviceId,
        watched_seconds: watchedSeconds,
    };
    const res = await api(`/video/${videoId}/views`, { method: "POST", body: JSON.stringify(payload) })
    return res
}
