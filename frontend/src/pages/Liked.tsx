import { useCallback } from "react";
import Grid from "@mui/material/Grid";
import VideoGrid from "../components/video/VideoGrid";
import { getUserLikedVideo } from "../api/users";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/theme";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";


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
        return <VideoGridSkeleton items={10} />;
    }

    if (error) {
        return <PageError error={error} />;
    }
    return (
        <>
            {Array.isArray(userLikedVideos) && userLikedVideos.length === 0 ? "Нет понравившихся" :
                <Grid container spacing={2} sx={pageSx.gridSection}>
                    <VideoGrid videos={Array.isArray(userLikedVideos) ? userLikedVideos : []} />
                </Grid >}
        </>
    );
}
