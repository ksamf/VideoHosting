export interface Comment {
    comment_id: string;
    username: string;
    user_avatar_url?: string;
    text: string;
    created_at: string;
}

export type AddComment = string;
export interface Reaction {
    reaction: "like" | "dislike" | null;
}
export interface AddReaction {
    message: string;
}
export interface UpdateViews {
    message: string;
}
