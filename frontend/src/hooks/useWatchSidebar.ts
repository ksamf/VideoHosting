import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChannelVideos } from "../api/videos";
import { getUserRecommendations } from "../api/users";
import type { Video } from "../types/video";

type UseWatchSidebarParams = {
    channelID: string | null;
    userID: string | null;
    isAuth: boolean;
    currentVideoID: string;
    pageSize?: number;
};

function uniqueByVideoID(list: Video[]): Video[] {
    const seen = new Set<string>();
    return list.filter((video) => {
        if (!video?.video_id || seen.has(video.video_id)) {
            return false;
        }
        seen.add(video.video_id);
        return true;
    });
}

export default function useWatchSidebar({
    channelID,
    userID,
    isAuth,
    currentVideoID,
    pageSize = 12,
}: UseWatchSidebarParams) {
    const channelLoadMoreRef = useRef<HTMLDivElement | null>(null);
    const recommendationLoadMoreRef = useRef<HTMLDivElement | null>(null);

    const [channelVideosRaw, setChannelVideosRaw] = useState<Video[]>([]);
    const [channelOffset, setChannelOffset] = useState<number>(0);
    const [channelHasMore, setChannelHasMore] = useState<boolean>(false);
    const [channelLoadingInitial, setChannelLoadingInitial] = useState<boolean>(false);
    const [channelLoadingMore, setChannelLoadingMore] = useState<boolean>(false);
    const [channelVideosError, setChannelVideosError] = useState<string | null>(null);

    const [recommendationsRaw, setRecommendationsRaw] = useState<Video[]>([]);
    const [recommendationOffset, setRecommendationOffset] = useState<number>(0);
    const [recommendationHasMore, setRecommendationHasMore] = useState<boolean>(false);
    const [recommendationLoadingInitial, setRecommendationLoadingInitial] = useState<boolean>(false);
    const [recommendationLoadingMore, setRecommendationLoadingMore] = useState<boolean>(false);
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

    const loadInitialChannelVideos = useCallback(async () => {
        if (!channelID) {
            setChannelVideosRaw([]);
            setChannelOffset(0);
            setChannelHasMore(false);
            setChannelVideosError(null);
            setChannelLoadingInitial(false);
            return;
        }

        setChannelLoadingInitial(true);
        setChannelVideosError(null);
        setChannelVideosRaw([]);
        setChannelOffset(0);
        setChannelHasMore(false);
        try {
            const page = await getChannelVideos(channelID, { limit: pageSize, offset: 0 });
            const safePage = Array.isArray(page) ? page : [];
            setChannelVideosRaw(uniqueByVideoID(safePage));
            setChannelOffset(safePage.length);
            setChannelHasMore(safePage.length === pageSize);
        } catch (err: unknown) {
            setChannelVideosError(err instanceof Error ? err.message : "Не удалось загрузить видео канала.");
        } finally {
            setChannelLoadingInitial(false);
        }
    }, [channelID, pageSize]);

    const loadMoreChannelVideos = useCallback(async () => {
        if (!channelID || channelLoadingInitial || channelLoadingMore || !channelHasMore) {
            return;
        }

        setChannelLoadingMore(true);
        setChannelVideosError(null);
        try {
            const page = await getChannelVideos(channelID, { limit: pageSize, offset: channelOffset });
            const safePage = Array.isArray(page) ? page : [];
            setChannelVideosRaw((prev) => uniqueByVideoID([...prev, ...safePage]));
            setChannelOffset((prev) => prev + safePage.length);
            setChannelHasMore(safePage.length === pageSize);
        } catch (err: unknown) {
            setChannelVideosError(err instanceof Error ? err.message : "Не удалось загрузить видео канала.");
        } finally {
            setChannelLoadingMore(false);
        }
    }, [channelHasMore, channelID, channelLoadingInitial, channelLoadingMore, channelOffset, pageSize]);

    const loadInitialRecommendations = useCallback(async () => {
        if (!isAuth || !userID) {
            setRecommendationsRaw([]);
            setRecommendationOffset(0);
            setRecommendationHasMore(false);
            setRecommendationsError(null);
            setRecommendationLoadingInitial(false);
            return;
        }

        setRecommendationLoadingInitial(true);
        setRecommendationsError(null);
        setRecommendationsRaw([]);
        setRecommendationOffset(0);
        setRecommendationHasMore(false);
        try {
            const page = await getUserRecommendations(userID, pageSize, 0);
            const safePage = Array.isArray(page) ? page : [];
            setRecommendationsRaw(uniqueByVideoID(safePage));
            setRecommendationOffset(safePage.length);
            setRecommendationHasMore(safePage.length === pageSize);
        } catch (err: unknown) {
            setRecommendationsError(err instanceof Error ? err.message : "Не удалось загрузить рекомендации.");
        } finally {
            setRecommendationLoadingInitial(false);
        }
    }, [isAuth, pageSize, userID]);

    const loadMoreRecommendations = useCallback(async () => {
        if (!isAuth || !userID || recommendationLoadingInitial || recommendationLoadingMore || !recommendationHasMore) {
            return;
        }

        setRecommendationLoadingMore(true);
        setRecommendationsError(null);
        try {
            const page = await getUserRecommendations(userID, pageSize, recommendationOffset);
            const safePage = Array.isArray(page) ? page : [];
            setRecommendationsRaw((prev) => uniqueByVideoID([...prev, ...safePage]));
            setRecommendationOffset((prev) => prev + safePage.length);
            setRecommendationHasMore(safePage.length === pageSize);
        } catch (err: unknown) {
            setRecommendationsError(err instanceof Error ? err.message : "Не удалось загрузить рекомендации.");
        } finally {
            setRecommendationLoadingMore(false);
        }
    }, [isAuth, pageSize, recommendationHasMore, recommendationLoadingInitial, recommendationLoadingMore, recommendationOffset, userID]);

    useEffect(() => {
        void loadInitialChannelVideos();
    }, [loadInitialChannelVideos]);

    useEffect(() => {
        if (!channelHasMore || channelLoadingInitial || channelLoadingMore || !channelLoadMoreRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMoreChannelVideos();
                }
            },
            { rootMargin: "200px 0px" },
        );

        observer.observe(channelLoadMoreRef.current);
        return () => observer.disconnect();
    }, [channelHasMore, channelLoadingInitial, channelLoadingMore, loadMoreChannelVideos]);

    useEffect(() => {
        void loadInitialRecommendations();
    }, [loadInitialRecommendations]);

    useEffect(() => {
        if (!recommendationHasMore || recommendationLoadingInitial || recommendationLoadingMore || !recommendationLoadMoreRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMoreRecommendations();
                }
            },
            { rootMargin: "200px 0px" },
        );

        observer.observe(recommendationLoadMoreRef.current);
        return () => observer.disconnect();
    }, [loadMoreRecommendations, recommendationHasMore, recommendationLoadingInitial, recommendationLoadingMore]);

    const channelVideoList = useMemo(() => {
        const list = Array.isArray(channelVideosRaw) ? channelVideosRaw : [];
        return uniqueByVideoID(list).filter((item) => item.video_id !== currentVideoID);
    }, [channelVideosRaw, currentVideoID]);

    const channelVideoSet = useMemo(
        () => new Set(channelVideoList.map((item) => item.video_id)),
        [channelVideoList]
    );

    const recommendationList = useMemo(() => {
        const list = Array.isArray(recommendationsRaw) ? recommendationsRaw : [];
        return uniqueByVideoID(list).filter((item) => item.video_id !== currentVideoID && !channelVideoSet.has(item.video_id));
    }, [channelVideoSet, recommendationsRaw, currentVideoID]);

    return {
        channelLoadMoreRef,
        recommendationLoadMoreRef,
        channelVideoList,
        recommendationList,
        channelHasMore,
        channelLoadingInitial,
        channelLoadingMore,
        channelVideosError,
        recommendationHasMore,
        recommendationLoadingInitial,
        recommendationLoadingMore,
        recommendationsError,
    };
}
