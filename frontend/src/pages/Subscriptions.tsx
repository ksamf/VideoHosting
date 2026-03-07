import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserSubscriptionsVideo } from "../api/users";
import { PageError } from "../components/common/PageState";
import VideoGrid from "../components/video/VideoGrid";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";
import type { Video } from "../types/video";

const SUBSCRIPTIONS_PAGE_SIZE = 12;

function uniqueByVideoID(list: Video[]): Video[] {
    const seen = new Set<string>();
    return list.filter((video) => {
        if (seen.has(video.video_id)) {
            return false;
        }
        seen.add(video.video_id);
        return true;
    });
}

export default function Subscriptions() {
    const { id } = useParams();
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const [videos, setVideos] = useState<Video[]>([]);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        if (!id) {
            setVideos([]);
            setOffset(0);
            setHasMore(false);
            setError(null);
            setLoadingInitial(false);
            return;
        }

        setLoadingInitial(true);
        setError(null);
        setVideos([]);
        setOffset(0);
        setHasMore(false);

        try {
            const page = await getUserSubscriptionsVideo(id, { limit: SUBSCRIPTIONS_PAGE_SIZE, offset: 0 });
            const safePage = Array.isArray(page) ? page : [];
            setVideos(uniqueByVideoID(safePage));
            setOffset(safePage.length);
            setHasMore(safePage.length === SUBSCRIPTIONS_PAGE_SIZE);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        } finally {
            setLoadingInitial(false);
        }
    }, [id]);

    const loadMore = useCallback(async () => {
        if (!id || loadingInitial || loadingMore || !hasMore) {
            return;
        }

        setLoadingMore(true);
        setError(null);
        try {
            const page = await getUserSubscriptionsVideo(id, { limit: SUBSCRIPTIONS_PAGE_SIZE, offset });
            const safePage = Array.isArray(page) ? page : [];
            setVideos((prev) => uniqueByVideoID([...prev, ...safePage]));
            setOffset((prev) => prev + safePage.length);
            setHasMore(safePage.length === SUBSCRIPTIONS_PAGE_SIZE);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, id, loadingInitial, loadingMore, offset]);

    useEffect(() => {
        void loadInitial();
    }, [loadInitial]);

    useEffect(() => {
        if (!hasMore || loadingInitial || loadingMore || !loadMoreRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMore();
                }
            },
            { rootMargin: "200px 0px" },
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore, loadingInitial, loadingMore]);

    if (loadingInitial) {
        return <VideoGridSkeleton items={10} />;
    }

    if (error) {
        return <PageError error={error} />;
    }

    return (
        <>
            {!id ? (
                <Typography color="text.secondary">Некорректный id пользователя.</Typography>
            ) : (
                <>
                    <VideoGrid videos={videos} />
                    {(hasMore || loadingMore) && (
                        <Box ref={loadMoreRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                            {loadingMore && <CircularProgress size={24} />}
                        </Box>
                    )}
                </>
            )}
        </>
    );
}
