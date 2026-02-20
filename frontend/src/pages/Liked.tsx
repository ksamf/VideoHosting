import { useCallback } from "react";
import Grid from "@mui/material/Grid";
import VideoGrid from "../components/video/VideoGrid";
import { getUserLikedVideo } from "../api/users";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { PageError, PageLoading } from "../components/common/PageState";


export default function Liked() {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.user_id ?? null;

    const fetchUserLikedVideos = useCallback(
        () => (userId ? getUserLikedVideo(userId) : Promise.resolve([])),
        [userId]
    );

    const {
        data: userLikedVideos,
        loading: userLikedVideosLoading,
        error: userLikedVideosError,
    } = useFetch(fetchUserLikedVideos);

    const loading = userLikedVideosLoading || authLoading;
    const error = userLikedVideosError;
    if (loading) {
        return <PageLoading />;
    }

    if (error) {
        return <PageError error={error} />;
    }
    return (
        <>
            {Array.isArray(userLikedVideos) && userLikedVideos.length === 0 ? "Нет понравившихся" :
                <Grid container spacing={2} sx={{ p: 2 }}>
                    <VideoGrid videos={Array.isArray(userLikedVideos) ? userLikedVideos : []} />
                </Grid >}
        </>
    );
}
