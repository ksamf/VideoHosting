import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import VideoGrid from "../components/video/VideoGrid";
import { getUserById, getUserVideos } from "../api/users";
import ChannelHeader from "../components/common/ChannelHeader";
import useFetch from "../hooks/useFetch";
import { PageError, PageLoading } from "../components/common/PageState";

export default function Channel() {
    const { id: channelId } = useParams();
    const { user: authUser, isAuth } = useAuth();
    const [sortBy, setSortBy] = useState("new");

    const fetchUserById = useCallback(
        () => (channelId ? getUserById(channelId) : Promise.resolve(null)),
        [channelId]
    );

    const {
        data: channel,
        loading: userByIdLoading,
        error: userByIdError,
    } = useFetch(fetchUserById);
    const fetchUserVideos = useCallback(
        () => (channelId ? getUserVideos(channelId) : Promise.resolve([])),
        [channelId]
    );

    const {
        data: videos,
        loading: videosLoading,
        error: videosError,
    } = useFetch(fetchUserVideos);

    const loading = userByIdLoading || videosLoading;
    const error = userByIdError || videosError;

    const safeVideos = useMemo(() => (Array.isArray(videos) ? videos : []), [videos]);
    const sortedVideos = useMemo(() => {
        const list = [...safeVideos];
        if (sortBy === "popular") {
            return list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        }
        if (sortBy === "old") {
            return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [safeVideos, sortBy]);

    if (!channelId) {
        return <Typography color="error" sx={{ px: 3, py: 2 }}>Некорректный id канала</Typography>;
    }


    if (loading) {
        return <PageLoading />;
    }

    if (error) {
        return <PageError error={error} />;
    }
    if (!channel) {
        return <Typography sx={(theme) => ({ color: theme.palette.text.secondary, px: 3, py: 2 })}>Канал не найден</Typography>;
    }
    return (

        <Box
            sx={{
                px: { xs: 2, md: 3 },
                pb: 3,
                mt: 2,
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems="flex-start"
            >
                <ChannelHeader channel={channel} authUser={authUser} isAuth={isAuth} countVideos={safeVideos.length} />

                <Stack sx={{ flex: 1, width: "100%" }}>
                    <Stack
                        sx={{ display: "flex", flexDirection: "row", p: 1 }}
                    >
                        <Button
                            onClick={() => setSortBy("new")}
                            variant={sortBy === "new" ? "contained" : "text"}
                            sx={{ borderRadius: 6, mr: 1 }}
                        >
                            Новые
                        </Button>
                        <Button
                            onClick={() => setSortBy("popular")}
                            variant={sortBy === "popular" ? "contained" : "text"}
                            sx={{ borderRadius: 6, mr: 1 }}
                        >
                            Популярные
                        </Button>
                        <Button
                            onClick={() => setSortBy("old")}
                            variant={sortBy === "old" ? "contained" : "text"}
                            sx={{ borderRadius: 6, mr: 1 }}
                        >
                            Старые
                        </Button>
                    </Stack>

                    <VideoGrid videos={sortedVideos} />
                </Stack>
            </Stack>
        </Box>
    );
}
