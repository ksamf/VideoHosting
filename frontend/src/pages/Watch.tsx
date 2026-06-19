import VideoPlayer from "../components/video/VideoPlayer";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link, useParams } from "react-router-dom";
import VideoInfo from "../components/video/VideoInfo";
import { getVideoById } from "../api/videos";
import { getUserByVideoId } from "../api/users";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { useCallback, useMemo } from "react";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/sx/page";
import WatchSkeleton from "../skeleton/WatchSkeleton";
import { shortenNumRu } from "../utils/ShortenNumRu";
import useWatchSidebar from "../hooks/useWatchSidebar";
import type { Video } from "../types/video";

type SidebarItemSource = "channel" | "recommendation";

function SidebarVideoItem({ video, source }: { video: Video; source: SidebarItemSource }) {
    const createdDate = video?.created_at ? new Date(video.created_at).toLocaleDateString("ru-RU") : "";

    return (
        <Box component={Link} to={`/watch/${video.video_id}`} sx={pageSx.watchSidebarItem}>
            <Box
                component="img"
                src={video.preview_url}
                alt={video.name}
                sx={pageSx.watchSidebarThumb}
            />
            <Box sx={pageSx.watchSidebarMeta}>
                <Typography sx={pageSx.watchSidebarMetaTitle}>
                    {video.name}
                </Typography>
                <Typography sx={pageSx.watchSidebarMetaSecondary}>
                    {video.username} • {source === "channel" ? "С этого канала" : "Рекомендуем"}
                </Typography>
                <Typography sx={pageSx.watchSidebarMetaSecondary}>
                    {shortenNumRu(Number(video.views || 0))} просмотров
                    {createdDate ? ` • ${createdDate}` : ""}
                </Typography>
            </Box>
        </Box>
    );
}

export default function Watch() {
    const { user, isAuth } = useAuth();
    const { id } = useParams();
    const userID = user?.user_id ?? null;

    const fetchVideo = useCallback(
        () => (id ? getVideoById(id) : Promise.resolve(null)),
        [id]
    );
    const fetchChannel = useCallback(
        () => (id ? getUserByVideoId(id) : Promise.resolve(null)),
        [id]
    );

    const {
        data: video,
        loading: videoLoading,
        error: videoError,
    } = useFetch(fetchVideo);
    const {
        data: channel,
        loading: channelLoading,
        error: channelError,
    } = useFetch(fetchChannel);
    const channelID = channel?.user_id ?? null;
    const currentVideoID = video?.video_id ?? "";
    const {
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
    } = useWatchSidebar({
        channelID,
        userID,
        isAuth,
        currentVideoID,
        pageSize: 12,
    });

    const loading = videoLoading || channelLoading;
    const error = videoError || channelError;
    const mixedSidebarVideos = useMemo(() => {
        const result: Array<{ video: Video; source: SidebarItemSource }> = [];
        const seen = new Set<string>();
        let channelIndex = 0;
        let recommendationIndex = 0;

        while (channelIndex < channelVideoList.length || recommendationIndex < recommendationList.length) {
            if (channelIndex < channelVideoList.length) {
                const item = channelVideoList[channelIndex++];
                if (!seen.has(item.video_id)) {
                    seen.add(item.video_id);
                    result.push({ video: item, source: "channel" });
                }
            }

            if (recommendationIndex < recommendationList.length) {
                const item = recommendationList[recommendationIndex++];
                if (!seen.has(item.video_id)) {
                    seen.add(item.video_id);
                    result.push({ video: item, source: "recommendation" });
                }
            }
        }

        return result;
    }, [channelVideoList, recommendationList]);
    const loadingInitialSidebar = channelLoadingInitial || (isAuth && recommendationLoadingInitial);
    const loadingMoreSidebar = channelLoadingMore || (isAuth && recommendationLoadingMore);
    const hasMoreSidebar = channelHasMore || (isAuth && recommendationHasMore);
    const sidebarError = channelVideosError || (isAuth ? recommendationsError : null);

    if (loading) {
        return <WatchSkeleton />;
    }

    if (error) {
        return <PageError error={error} />;
    }

    if (!id) {
        return (
            <Typography sx={pageSx.mutedMessage}>
                Некорректный id видео
            </Typography>
        );
    }

    if (!video) {
        return (
            <Typography sx={pageSx.mutedMessage}>
                Видео не найдено
            </Typography>
        );
    }

    return (
        <Box sx={pageSx.watchContainer}>
            <Box sx={pageSx.watchLayout}>
                <Box sx={pageSx.watchMainColumn}>
                    <VideoPlayer
                        src={video.video_url}
                        poster={video.preview_url}
                        qualities={video.qualities}
                        videoId={video.video_id}
                    />
                    <VideoInfo video={video} channel={channel} user={user} isAuth={isAuth} />
                </Box>

                <Box sx={pageSx.watchSidebar}>
                    <Box sx={pageSx.watchSidebarSection}>
                        <Typography variant="subtitle1" fontWeight={600} sx={pageSx.watchSidebarTitle}>
                            Следующее
                        </Typography>
                        {loadingInitialSidebar && mixedSidebarVideos.length === 0 ? (
                            <Box sx={pageSx.watchSidebarLoader}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : mixedSidebarVideos.length === 0 ? (
                            <Typography sx={pageSx.searchMuted}>
                                {sidebarError ?? "Пока нет видео для продолжения просмотра."}
                            </Typography>
                        ) : (
                            <Stack spacing={0.4}>
                                {mixedSidebarVideos.map(({ video: item, source }) => (
                                    <SidebarVideoItem key={item.video_id} video={item} source={source} />
                                ))}
                            </Stack>
                        )}
                        {mixedSidebarVideos.length > 0 && sidebarError && (
                            <Typography sx={pageSx.searchMuted}>
                                Часть ленты временно недоступна.
                            </Typography>
                        )}
                        {channelHasMore && <Box ref={channelLoadMoreRef} sx={{ height: 1 }} />}
                        {isAuth && recommendationHasMore && <Box ref={recommendationLoadMoreRef} sx={{ height: 1 }} />}
                        {hasMoreSidebar && loadingMoreSidebar && (
                            <Box sx={pageSx.watchSidebarLoader}>
                                <CircularProgress size={18} />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

