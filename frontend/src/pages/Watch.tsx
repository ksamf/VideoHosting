import VideoPlayer from "../components/video/VideoPlayer";
import { useParams } from "react-router-dom";
import { getVideoById } from "../api/videos";
import { getUserByVideoId } from "../api/users";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import VideoInfo from "../components/video/VideoInfo";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { useCallback } from "react";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/theme";
import WatchSkeleton from "../skeleton/WatchSkeleton";

export default function Watch() {
    const { user, isAuth } = useAuth();

    const { id } = useParams();


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
            <VideoPlayer
                src={video.video_url}
                poster={video.preview_url}
                qualities={video.qualities}
                videoId={video.video_id}
            />
            <VideoInfo video={video} channel={channel} user={user} isAuth={isAuth} />
        </Box>
    );
}
