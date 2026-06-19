export interface Video {
    video_id: string;
    user_id: string;
    name: string;
    description?: string;
    video_url: string;
    preview_url: string;
    username: string;
    user_avatar_url: string;
    views: number;
    duration_seconds?: number;
    status?: string;
    created_at: string;
}

export interface VideoDetails extends Video {
    qualities: number[];
    likes: number;
    dislikes: number;
    comment_count?: number;
    tags?: string[];
}

export type VideosResponse = VideoDetails[];

export interface UploadVideoResponse {
    video_id: string;
    status: string
}
