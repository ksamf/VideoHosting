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
import { PageError, PageLoading } from "../components/common/PageState";

export default function Watch() {
    const { user, isAuth } = useAuth();

    const { id } = useParams();


    const fetchVideo = useCallback(() => getVideoById(id), [id]);
    const fetchChannel = useCallback(() => getUserByVideoId(id), [id]);

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
        return <PageLoading />;
    }

    if (error) {
        return <PageError error={error} />;
    }

    if (!video) {
        return (
            <Typography sx={(theme) => ({ color: theme.palette.text.secondary })}>
                Видео не найдено
            </Typography>
        );
    }

    return (
        <Box sx={{ maxWidth: 1500, mt: 2, ml: 4 }}>
            <VideoPlayer
                src={video.video_url}
                poster={video.preview_url}
                qualities={video.qualities}
                videoId={video.video_id}
                isAuth={isAuth}
            />
            <VideoInfo video={video} channel={channel} user={user} isAuth={isAuth} />
        </Box>
    );
}
