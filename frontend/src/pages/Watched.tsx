import { useCallback } from "react";
import Grid from "@mui/material/Grid";
import VideoGrid from "../components/video/VideoGrid";
import { getUserWatchedVideo } from "../api/users";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { Typography } from "@mui/material";
import { PageError, PageLoading } from "../components/common/PageState";


export default function Watched() {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.user_id ?? null;
    const fetchWatched = useCallback(
        () => (userId ? getUserWatchedVideo(userId) : Promise.resolve([])),
        [userId]
    );

    const {
        data: video,
        loading: videoLoading,
        error: videoError,
    } = useFetch(fetchWatched);

    const loading = videoLoading || authLoading;
    const watchedVideos = Array.isArray(video) ? video : [];

    if (loading) {
        return <PageLoading />;
    }
    if (videoError) {
        return <PageError error={videoError} />;
    }
    return (
        <>{watchedVideos.length === 0 ? "Нет просмотренных" :
            <Grid container spacing={2} sx={{ p: 2 }}>
                <VideoGrid videos={watchedVideos} />
            </Grid >}

        </>
    );
}
