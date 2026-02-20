import { useCallback } from "react";
import Grid from "@mui/material/Grid";
import { getVideos } from "../api/videos";
import VideoGrid from "../components/video/VideoGrid";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { getUserRecommendations } from "../api/users";
import { PageError, PageLoading } from "../components/common/PageState";
import { pageSx } from "../styles/theme";

export default function Home() {
    const { user, loading: authLoading, isAuth } = useAuth();
    const userId = user?.user_id ?? null;

    const fetchRecommendations = useCallback(
        () => (userId ? getUserRecommendations(userId, 10, 0) : Promise.resolve([])),
        [userId]
    );

    const fetchVideos = useCallback(() => getVideos({ limit: 10, offset: 0 }), []);
    const { data: recommendations } = useFetch(fetchRecommendations);
    const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];

    const {
        data: videos,
        loading: videosLoading,
        error: videosError,
    } = useFetch(fetchVideos);
    const safeVideos = Array.isArray(videos) ? videos : [];

    const loading = videosLoading || authLoading;
    const error = videosError;
    if (loading) {
        return <PageLoading />;
    }

    if (error) {
        return <PageError error={error} />;
    }
    return (
        <Grid container spacing={2} sx={pageSx.gridSection}>
            {isAuth
                ? <VideoGrid videos={safeRecommendations.length > 0 ? safeRecommendations : safeVideos} />
                : <VideoGrid videos={safeVideos} />}
        </Grid >
    );
}
