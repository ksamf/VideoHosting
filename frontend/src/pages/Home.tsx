import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { getVideos } from "../api/videos";
import VideoGrid from "../components/video/VideoGrid";
import useAuth from "../hooks/useAuth";
import { getUserRecommendations } from "../api/users";
import { PageError } from "../components/common/PageState";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";
import type { Video } from "../types/video";
import { pageSx } from "../styles/sx/page";

const HOME_PAGE_SIZE = 12;

type FeedSource = "recommendations" | "videos";

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

export default function Home() {
    const { user, loading: authLoading, isAuth } = useAuth();
    const userId = user?.user_id ?? null;
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const [videos, setVideos] = useState<Video[]>([]);
    const [source, setSource] = useState<FeedSource>("videos");
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        if (authLoading) {
            return;
        }

        setLoadingInitial(true);
        setError(null);
        setVideos([]);
        setOffset(0);
        setHasMore(false);

        if (isAuth && userId) {
            try {
                const recommended = await getUserRecommendations(userId, HOME_PAGE_SIZE, 0);
                const safeRecommended = Array.isArray(recommended) ? recommended : [];

                if (safeRecommended.length > 0) {
                    setSource("recommendations");
                    setVideos(uniqueByVideoID(safeRecommended));
                    setOffset(safeRecommended.length);
                    setHasMore(safeRecommended.length === HOME_PAGE_SIZE);
                    setLoadingInitial(false);
                    return;
                }
            } catch {
                // fallback to common feed below
            }
        }

        try {
            const general = await getVideos({ limit: HOME_PAGE_SIZE, offset: 0 });
            const safeGeneral = Array.isArray(general) ? general : [];
            setSource("videos");
            setVideos(uniqueByVideoID(safeGeneral));
            setOffset(safeGeneral.length);
            setHasMore(safeGeneral.length === HOME_PAGE_SIZE);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        } finally {
            setLoadingInitial(false);
        }
    }, [authLoading, isAuth, userId]);

    const loadMore = useCallback(async () => {
        if (loadingInitial || loadingMore || !hasMore) {
            return;
        }

        setLoadingMore(true);
        setError(null);
        try {
            if (source === "recommendations" && userId) {
                const recommended = await getUserRecommendations(userId, HOME_PAGE_SIZE, offset);
                const safeRecommended = Array.isArray(recommended) ? recommended : [];

                if (safeRecommended.length > 0) {
                    setVideos((prev) => uniqueByVideoID([...prev, ...safeRecommended]));
                    setOffset((prev) => prev + safeRecommended.length);
                    setHasMore(safeRecommended.length === HOME_PAGE_SIZE);
                    return;
                }

                const general = await getVideos({ limit: HOME_PAGE_SIZE, offset: 0 });
                const safeGeneral = Array.isArray(general) ? general : [];
                setSource("videos");
                setVideos((prev) => uniqueByVideoID([...prev, ...safeGeneral]));
                setOffset(safeGeneral.length);
                setHasMore(safeGeneral.length === HOME_PAGE_SIZE);
                return;
            }

            const general = await getVideos({ limit: HOME_PAGE_SIZE, offset });
            const safeGeneral = Array.isArray(general) ? general : [];
            setVideos((prev) => uniqueByVideoID([...prev, ...safeGeneral]));
            setOffset((prev) => prev + safeGeneral.length);
            setHasMore(safeGeneral.length === HOME_PAGE_SIZE);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingInitial, loadingMore, offset, source, userId]);

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
            { rootMargin: "200px 0px" }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingInitial, loadingMore, loadMore]);

    if (authLoading || loadingInitial) {
        return <VideoGridSkeleton items={10} />;
    }

    if (error) {
        return <PageError error={error} />;
    }
    return (
        <Box sx={pageSx.pageContainer}>
            <VideoGrid videos={videos} />
            {(hasMore || loadingMore) && (
                <Box ref={loadMoreRef} sx={pageSx.infiniteLoader}>
                    {loadingMore && <CircularProgress size={24} />}
                </Box>
            )}
        </Box>
    );
}
