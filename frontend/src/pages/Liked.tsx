import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { getUserLikedVideo } from "../api/users";
import { PageError } from "../components/common/PageState";
import VideoGrid from "../components/video/VideoGrid";
import useAuth from "../hooks/useAuth";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";
import type { Video } from "../types/video";
import { pageSx } from "../styles/sx/page";

const LIKED_PAGE_SIZE = 12;

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

export default function Liked() {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.user_id ?? null;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const [videos, setVideos] = useState<Video[]>([]);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        if (!userId) {
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
            const page = await getUserLikedVideo(userId, { limit: LIKED_PAGE_SIZE, offset: 0 });
            const safePage = Array.isArray(page) ? page : [];
            setVideos(uniqueByVideoID(safePage));
            setOffset(safePage.length);
            setHasMore(safePage.length === LIKED_PAGE_SIZE);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        } finally {
            setLoadingInitial(false);
        }
    }, [userId]);

    const loadMore = useCallback(async () => {
        if (!userId || loadingInitial || loadingMore || !hasMore) {
            return;
        }

        setLoadingMore(true);
        setError(null);
        try {
            const page = await getUserLikedVideo(userId, { limit: LIKED_PAGE_SIZE, offset });
            const safePage = Array.isArray(page) ? page : [];
            setVideos((prev) => uniqueByVideoID([...prev, ...safePage]));
            setOffset((prev) => prev + safePage.length);
            setHasMore(safePage.length === LIKED_PAGE_SIZE);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingInitial, loadingMore, offset, userId]);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        void loadInitial();
    }, [authLoading, loadInitial]);

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

    if (authLoading || loadingInitial) {
        return <VideoGridSkeleton items={10} />;
    }

    if (error) {
        return <PageError error={error} />;
    }

    if (!userId) {
        return <Typography sx={pageSx.pageStateText}>Требуется авторизация.</Typography>;
    }

    return (
        <Box sx={pageSx.pageContainer}>
            {videos.length === 0 ? (
                <Typography sx={pageSx.pageStateText}>Нет понравившихся.</Typography>
            ) : (
                <>
                    <VideoGrid videos={videos} />
                    {(hasMore || loadingMore) && (
                        <Box ref={loadMoreRef} sx={pageSx.infiniteLoader}>
                            {loadingMore && <CircularProgress size={24} />}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}

