import { Stack, Typography, Input, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactTimeAgo from "react-time-ago";
import { getComments } from "../../api/videos";
import useFetch from "../../hooks/useFetch";
import useCommentForm from "../../hooks/useCommentForm";
import UserAvatar from "../common/UserAvatar";
import { useCallback, useMemo, useState } from "react";
import type { Comment } from "../../types/action";
import type { VideoDetails } from "../../types/video";
import type { User } from "../../types/user";

type VideoCommentsProps = {
    video: VideoDetails;
    user: User | null;
    isAuth: boolean;
};

type UIComment = Comment & {
    comment_text?: string;
};

type NewCommentPayload =
    | string
    | {
        comment_id?: string;
        text?: string;
        comment_text?: string;
        created_at?: string;
    };

export default function VideoComments({ video, user, isAuth }: VideoCommentsProps) {
    const videoId = video?.video_id ?? null;
    const fetchComments = useCallback(
        () => (videoId ? getComments(videoId) : Promise.resolve([])),
        [videoId]
    );

    const { data: fetchedComments = [], loading: commentsLoading, refetch } = useFetch(fetchComments);
    const [optimistic, setOptimistic] = useState<UIComment[]>([]);

    const safeFetchedComments = useMemo(
        () => (Array.isArray(fetchedComments) ? fetchedComments : []),
        [fetchedComments]
    );
    const persistedIds = useMemo(
        () => new Set(safeFetchedComments.map((c) => c.comment_id)),
        [safeFetchedComments]
    );
    const visibleOptimistic = useMemo(
        () => optimistic.filter((c) => !persistedIds.has(c.comment_id)),
        [optimistic, persistedIds]
    );
    const comments = useMemo(
        () => [...visibleOptimistic, ...safeFetchedComments],
        [visibleOptimistic, safeFetchedComments]
    );


    const {
        commentText,
        setCommentText,
        sendingComment,
        error,
        isDisabledSend,
        handleSubmitComment,
    } = useCommentForm(video?.video_id, (newComment: NewCommentPayload, rawText: string) => {
        const commentPayload = typeof newComment === "string" ? null : newComment;
        const createdCommentId =
            typeof newComment === "string"
                ? newComment
                : (commentPayload?.comment_id ?? crypto.randomUUID());
        const optimistic: UIComment = {
            comment_id: createdCommentId,
            text: commentPayload?.text ?? commentPayload?.comment_text ?? rawText,
            created_at: commentPayload?.created_at ?? new Date().toISOString(),
            username: user?.username ?? "Вы",
            user_avatar_url: user?.avatar_url ?? "",
        };
        setOptimistic((prev) => [optimistic, ...prev]);
        refetch();
    });

    if (commentsLoading) {
        return (
            <Typography sx={(theme) => ({ color: theme.palette.text.secondary })}>
                Загрузка...
            </Typography>
        );
    }

    return (
        <Stack mt={3}>
            <Typography color="text.primary" fontSize={16} fontWeight={500} mb={2}>
                {comments == null ? 0 : comments.length} комментариев
            </Typography>

            {isAuth && (
                <Stack
                    component="form"
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    mb={3}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitComment();
                    }}
                >
                    <UserAvatar username={user.username} avatar_url={user.avatar_url} />

                    <Input
                        fullWidth
                        placeholder="Добавьте комментарий…"
                        disableUnderline
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 5,
                            fontSize: 14,
                            bgcolor: (theme) => theme.palette.background.paper,
                            color: (theme) => theme.palette.text.primary,
                        }}
                        endAdornment={
                            <IconButton type="submit" disabled={isDisabledSend || sendingComment}>
                                <SendIcon
                                    sx={{
                                        color: (theme) =>
                                            isDisabledSend ? theme.palette.text.secondary : theme.palette.text.primary,
                                    }}
                                />
                            </IconButton>
                        }
                    />
                </Stack>
            )}

            {error && (
                <Typography color="error" fontSize={12} mb={2}>
                    {error}
                </Typography>
            )}

            <Stack spacing={2}>
                {comments != null && comments.map((comment) => (
                    <Stack key={comment.comment_id} spacing={0.5}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <UserAvatar username={comment.username} avatar_url={comment.user_avatar_url} />
                            <Stack flex={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography fontSize={13} fontWeight={500} color="text.primary">
                                        {comment.username}
                                    </Typography>
                                    <Typography fontSize={12} sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                        <ReactTimeAgo date={new Date(comment.created_at)} locale="ru-RU" />
                                    </Typography>
                                </Stack>
                                <Typography fontSize={13} sx={{ mt: 0.5 }} color="text.primary">
                                    {comment.text ?? comment.comment_text}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Stack >
    );
}
