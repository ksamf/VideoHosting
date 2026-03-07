import VideoPlayer from "../components/video/VideoPlayer";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link, useParams } from "react-router-dom";
import VideoInfo from "../components/video/VideoInfo";
import { getVideoById } from "../api/videos";
import { getUserByVideoId } from "../api/users";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { useCallback } from "react";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/sx/page";
import WatchSkeleton from "../skeleton/WatchSkeleton";
import { shortenNumRu } from "../utils/ShortenNumRu";
import useWatchSidebar from "../hooks/useWatchSidebar";
import type { Video } from "../types/video";

function SidebarVideoItem({ video }: { video: Video }) {
    return (
        <Box component={Link} to={`/watch/${video.video_id}`} sx={pageSx.watchSidebarItem}>
            <Box
                component="img"
                src={video.preview_url}
                alt={video.name}
                sx={pageSx.watchSidebarThumb}
            />
            <Box sx={pageSx.watchSidebarMeta}>
                <Typography variant="body2" fontWeight={600} noWrap>
                    {video.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {video.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {shortenNumRu(Number(video.views || 0))} просмотров
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
                    <Typography variant="subtitle1" fontWeight={600} sx={pageSx.watchSidebarTitle}>
                        С этого канала
                    </Typography>
                    {channelLoadingInitial ? (
                        <Box sx={pageSx.watchSidebarLoader}>
                            <CircularProgress size={20} />
                        </Box>
                    ) : channelVideosError ? (
                        <Typography sx={pageSx.searchMuted}>
                            Не удалось загрузить видео канала.
                        </Typography>
                    ) : channelVideoList.length === 0 ? (
                        <Typography sx={pageSx.searchMuted}>
                            Других видео пока нет.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {channelVideoList.map((item) => (
                                <SidebarVideoItem key={item.video_id} video={item} />
                            ))}
                        </Stack>
                    )}
                    {channelHasMore && <Box ref={channelLoadMoreRef} sx={{ height: 1 }} />}
                    {channelLoadingMore && (
                        <Box sx={pageSx.watchSidebarLoader}>
                            <CircularProgress size={18} />
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight={600} sx={pageSx.watchSidebarTitle}>
                        Рекомендуем
                    </Typography>
                    {!isAuth ? (
                        <Typography sx={pageSx.searchMuted}>
                            Войдите в аккаунт, чтобы видеть персональные рекомендации.
                        </Typography>
                    ) : recommendationLoadingInitial ? (
                        <Box sx={pageSx.watchSidebarLoader}>
                            <CircularProgress size={20} />
                        </Box>
                    ) : recommendationsError ? (
                        <Typography sx={pageSx.searchMuted}>
                            Не удалось загрузить рекомендации.
                        </Typography>
                    ) : recommendationList.length === 0 ? (
                        <Typography sx={pageSx.searchMuted}>
                            Рекомендаций пока нет.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {recommendationList.map((item) => (
                                <SidebarVideoItem key={item.video_id} video={item} />
                            ))}
                        </Stack>
                    )}
                    {isAuth && recommendationHasMore && <Box ref={recommendationLoadMoreRef} sx={{ height: 1 }} />}
                    {isAuth && recommendationLoadingMore && (
                        <Box sx={pageSx.watchSidebarLoader}>
                            <CircularProgress size={18} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

