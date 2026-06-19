import { Box, Checkbox, CircularProgress, FormControlLabel, IconButton, Input, Stack, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactTimeAgo from "react-time-ago";
import { getComments } from "../../api/videos";
import useCommentForm from "../../hooks/useCommentForm";
import UserAvatar from "../common/UserAvatar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Comment } from "../../types/action";
import type { VideoDetails } from "../../types/video";
import type { User } from "../../types/user";
import { PUBLIC_CONTENT_CONSENT_TEXT } from "../../utils/privacy";

type VideoCommentsProps = {
    video: VideoDetails;
    user: User | null;
    isAuth: boolean;
};

type UIComment = Comment;
type OptimisticComment = UIComment & { _videoId: string };

type NewCommentPayload =
    | string
    | {
        comment_id?: string;
        text?: string;
        comment_text?: string;
        created_at?: string;
    };

const COMMENTS_PAGE_SIZE = 20;

export default function VideoComments({ video, user, isAuth }: VideoCommentsProps) {
    const videoId = video?.video_id ?? null;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const [fetchedComments, setFetchedComments] = useState<Comment[]>([]);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [optimistic, setOptimistic] = useState<OptimisticComment[]>([]);
    const [publicContentConsent, setPublicContentConsent] = useState(false);

    const loadFirstPage = useCallback(async () => {
        if (!videoId) {
            setFetchedComments([]);
            setOffset(0);
            setHasMore(false);
            setLoadError(null);
            setOptimistic([]);
            setLoadingInitial(false);
            return;
        }

        setLoadingInitial(true);
        setLoadError(null);
        try {
            const page = await getComments(videoId, { limit: COMMENTS_PAGE_SIZE, offset: 0 });
            const safePage = Array.isArray(page) ? page : [];
            setFetchedComments(safePage);
            setOffset(safePage.length);
            setHasMore(safePage.length === COMMENTS_PAGE_SIZE);
        } catch (err: unknown) {
            setFetchedComments([]);
            setOffset(0);
            setHasMore(false);
            setLoadError(err instanceof Error ? err.message : "Не удалось загрузить комментарии");
        } finally {
            setLoadingInitial(false);
        }
    }, [videoId]);

    const loadMoreComments = useCallback(async () => {
        if (!videoId || loadingInitial || loadingMore || !hasMore) {
            return;
        }

        setLoadingMore(true);
        setLoadError(null);
        try {
            const page = await getComments(videoId, { limit: COMMENTS_PAGE_SIZE, offset });
            const safePage = Array.isArray(page) ? page : [];

            setFetchedComments((prev) => {
                const seen = new Set(prev.map((comment) => comment.comment_id));
                const unique = safePage.filter((comment) => !seen.has(comment.comment_id));
                return [...prev, ...unique];
            });
            setOffset((prev) => prev + safePage.length);
            setHasMore(safePage.length === COMMENTS_PAGE_SIZE);
        } catch (err: unknown) {
            setLoadError(err instanceof Error ? err.message : "Не удалось загрузить комментарии");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingInitial, loadingMore, offset, videoId]);

    useEffect(() => {
        void loadFirstPage();
    }, [loadFirstPage]);

    useEffect(() => {
        if (!hasMore || loadingInitial || loadingMore || !loadMoreRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMoreComments();
                }
            },
            { rootMargin: "200px 0px" }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingInitial, loadingMore, loadMoreComments]);

    const safeFetchedComments = useMemo(() => fetchedComments, [fetchedComments]);
    const persistedIds = useMemo(
        () => new Set(safeFetchedComments.map((c) => c.comment_id)),
        [safeFetchedComments]
    );
    const visibleOptimistic = useMemo(
        () => optimistic.filter((c) => c._videoId === videoId && !persistedIds.has(c.comment_id)),
        [optimistic, persistedIds, videoId]
    );
    const comments = useMemo(
        () => [...visibleOptimistic, ...safeFetchedComments],
        [visibleOptimistic, safeFetchedComments]
    );


    const {
        commentText,
        setCommentText,
        sendingComment,
        error: sendError,
        isDisabledSend,
        handleSubmitComment,
    } = useCommentForm(videoId ?? "", (newComment: NewCommentPayload, rawText: string) => {
        const commentPayload = typeof newComment === "string" ? null : newComment;
        const createdCommentID = typeof newComment === "string"
            ? newComment
            : (commentPayload?.comment_id ?? crypto.randomUUID());

        const optimisticComment: OptimisticComment = {
            comment_id: createdCommentID,
            text: commentPayload?.text ?? commentPayload?.comment_text ?? rawText,
            created_at: commentPayload?.created_at ?? new Date().toISOString(),
            username: user?.username ?? "Вы",
            user_avatar_url: user?.avatar_url ?? "",
            _videoId: videoId ?? "",
        };

        setOptimistic((prev) => [optimisticComment, ...prev]);
        void loadFirstPage();
    });
    const isSubmitDisabled = isDisabledSend || sendingComment || !publicContentConsent;

    if (loadingInitial) {
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

            {isAuth && user && (
                <Stack
                    component="form"
                    spacing={1}
                    mb={3}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (videoId) {
                            void handleSubmitComment(publicContentConsent);
                        }
                    }}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
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
                                <IconButton type="submit" disabled={isSubmitDisabled}>
                                    <SendIcon
                                        sx={{
                                            color: (theme) =>
                                                isSubmitDisabled ? theme.palette.text.secondary : theme.palette.text.primary,
                                        }}
                                    />
                                </IconButton>
                            }
                        />
                    </Stack>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={publicContentConsent}
                                onChange={(e) => setPublicContentConsent(e.target.checked)}
                                disabled={sendingComment}
                            />
                        }
                        label={
                            <Typography fontSize={12} color="text.secondary">
                                {PUBLIC_CONTENT_CONSENT_TEXT} Комментарий будет виден другим пользователям.
                            </Typography>
                        }
                        sx={{ m: 0, alignItems: "flex-start", pl: { xs: 0, sm: 6 } }}
                    />
                </Stack>
            )}

            {sendError && (
                <Typography color="error" fontSize={12} mb={2}>
                    {sendError}
                </Typography>
            )}

            {loadError && (
                <Typography color="error" fontSize={12} mb={2}>
                    {loadError}
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
                                <Typography fontSize={13} sx={{ mt: 0.5, wordBreak: "break-word" }} color="text.primary">
                                    {comment.text}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                ))}
            </Stack>

            {(hasMore || loadingMore) && (
                <Box ref={loadMoreRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    {loadingMore && <CircularProgress size={22} />}
                </Box>
            )}
        </Stack >
    );
}
