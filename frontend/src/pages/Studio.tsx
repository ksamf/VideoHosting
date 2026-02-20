import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { getUserSubscriptionsCount, getUserVideos, getUserViewsCount } from "../api/users";
import { formattedDate } from "../utils/FormattedDate";
import { Stack } from "@mui/material";
import useFetch from "../hooks/useFetch";
import { PageError, PageLoading } from "../components/common/PageState";
import { pageSx } from "../styles/theme";

export default function Studio() {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.user_id ?? null;
    const navigate = useNavigate();

    const fetchSubscriptionsCount = useCallback(
        () => (userId ? getUserSubscriptionsCount(userId, 30) : Promise.resolve({ subscriptions: 0 })),
        [userId]
    );
    const fetchUserViewsCount = useCallback(
        () => (userId ? getUserViewsCount(userId) : Promise.resolve({ subscriptions: 0 })),
        [userId]
    );
    const fetchUserViewsCountPeriod = useCallback(
        () => (userId ? getUserViewsCount(userId, 30) : Promise.resolve({ subscriptions: 0 })),
        [userId]
    );
    const fetchUserVideos = useCallback(
        () => (userId ? getUserVideos(userId) : Promise.resolve([])),
        [userId]
    );

    const {
        data: subscriptionsCountPeriod,
        loading: subscriptionsCountPeriodLoading,
        error: subscriptionsCountPeriodError,
    } = useFetch(fetchSubscriptionsCount);
    const {
        data: userViewsCount,
        loading: userViewsCountLoading,
        error: userViewsCountError,
    } = useFetch(fetchUserViewsCount);
    const {
        data: userViewsCountPeriod,
        loading: userViewsCountPeriodLoading,
        error: userViewsCountPeriodError,
    } = useFetch(fetchUserViewsCountPeriod);
    const {
        data: userVideo,
        loading: userVideoLoading,
        error: userVideoError,
    } = useFetch(fetchUserVideos);

    const userVideos = Array.isArray(userVideo) ? userVideo : [];
    const bestVideo = userVideos.length > 0 ? [...userVideos].sort((a, b) => b.views - a.views)[0] : null;

    const loading =
        subscriptionsCountPeriodLoading ||
        userViewsCountLoading ||
        userViewsCountPeriodLoading ||
        userVideoLoading ||
        authLoading;
    const error = subscriptionsCountPeriodError || userViewsCountError || userViewsCountPeriodError || userVideoError;

    if (loading) {
        return <PageLoading />;
    }

    if (error) {
        return <PageError error={error} />;
    }

    return (
        <Box sx={pageSx.studioRoot}>
            <Typography
                variant="h4"
                sx={pageSx.studioHeader}
            >
                Аналитика канала
            </Typography>

            <Grid container spacing={2} sx={pageSx.studioMetricsGrid}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={pageSx.studioCard}>
                        <Typography sx={pageSx.studioCardLabel}>
                            Подписчики (за 30 дней)
                        </Typography>
                        <Typography fontSize={22} fontWeight={600}>
                            {user?.subscriptions ?? 0} +{subscriptionsCountPeriod?.subscriptions ?? 0}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={pageSx.studioCard}>
                        <Typography sx={pageSx.studioCardLabel}>
                            Просмотров за 30 дней
                        </Typography>
                        <Typography fontSize={22} fontWeight={600}>
                            {userViewsCount?.subscriptions ?? 0} +{userViewsCountPeriod?.subscriptions ?? 0}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        component={Link}
                        to={bestVideo ? `/watch/${bestVideo.video_id}` : "#"}
                        sx={pageSx.studioBestVideoCard}
                    >
                        <Typography sx={pageSx.studioBestVideoTitle}>
                            Лучшее видео
                        </Typography>
                        {bestVideo ? (
                            <Stack sx={pageSx.studioBestVideoRow}>
                                <img
                                    src={bestVideo.preview_url}
                                    alt="preview"
                                    style={pageSx.studioBestVideoImage}
                                />
                                <Typography fontSize={16} fontWeight={500} sx={pageSx.studioBestVideoName} noWrap>
                                    {bestVideo.name}
                                </Typography>
                            </Stack>
                        ) : (
                            "Нет видео"
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Typography
                variant="h6"
                sx={pageSx.studioVideosTitle}
            >
                Ваши видео
            </Typography>

            <TableContainer
                component={Paper}
                sx={pageSx.studioTableContainer}
            >
                <Table sx={pageSx.studioTable}>
                    <TableHead>
                        <TableRow sx={pageSx.studioTableHeadRow}>
                            <TableCell>Видео</TableCell>
                            <TableCell align="center">Дата</TableCell>
                            <TableCell align="center">Просмотры</TableCell>
                            <TableCell align="center">Комментарии</TableCell>
                            <TableCell align="center">Лайки / Дизлайки</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {userVideos.map((video) => (
                            <TableRow
                                key={video.video_id}
                                sx={pageSx.studioTableRow}
                            >
                                <TableCell align="center" sx={pageSx.studioVideoCell} onClick={() => navigate(`/watch/${video.video_id}`)}>
                                    <img
                                        src={video.preview_url}
                                        alt="preview"
                                        style={pageSx.studioVideoImage}
                                    />
                                    <Typography sx={pageSx.studioVideoName}>
                                        {video.name}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">{formattedDate(video.created_at)}</TableCell>
                                <TableCell align="center">{video.views}</TableCell>
                                <TableCell align="center">{video.comment_count}</TableCell>
                                <TableCell align="center">{video.likes} / {video.dislikes}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Outlet />
        </Box>
    );
}
