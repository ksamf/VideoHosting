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
        <Box
            sx={{
                p: { xs: 2, md: 3 },
                maxWidth: 1200,
                mx: "auto",
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 600,
                    mb: 2,
                }}
            >
                Аналитика канала
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                        sx={{
                            p: 2,
                            bgcolor: "#181818",
                            borderRadius: 3,
                        }}
                    >
                        <Typography color="#aaa" fontSize={13}>
                            Подписчики (за 30 дней)
                        </Typography>
                        <Typography fontSize={22} fontWeight={600}>
                            {user?.subscriptions ?? 0} +{subscriptionsCountPeriod?.subscriptions ?? 0}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={{ p: 2, bgcolor: "#181818", borderRadius: 3 }}>
                        <Typography color="#aaa" fontSize={13}>
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
                        sx={{
                            p: 2,
                            bgcolor: "#181818",
                            borderRadius: 3,
                            display: "block",
                            textDecoration: "none",
                            color: "inherit",
                            "&:visited": { color: "inherit" },
                            "&:hover": { bgcolor: "#202020" },
                        }}
                    >
                        <Typography color="#aaa" fontSize={13} sx={{ mb: 1 }}>
                            Лучшее видео
                        </Typography>
                        {bestVideo ? (
                            <Stack flexDirection="row" sx={{ display: "flex" }}>
                                <img
                                    src={bestVideo.preview_url}
                                    alt="preview"
                                    style={{
                                        width: "15%",
                                        height: "15%",
                                        borderRadius: 3,
                                    }}
                                />
                                <Typography fontSize={16} fontWeight={500} sx={{ ml: 2, display: "flex", alignItems: "center" }} noWrap>
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
                sx={{
                    fontWeight: 600,
                    mb: 1,
                }}
            >
                Ваши видео
            </Typography>

            <TableContainer
                component={Paper}
                sx={{
                    bgcolor: "#181818",
                    borderRadius: 3,
                }}
            >
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow
                            sx={{
                                "& th": {
                                    color: "#aaa",
                                    borderColor: "#222",
                                    fontWeight: 600,
                                },
                            }}
                        >
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
                                sx={{
                                    "& td": {
                                        borderColor: "#222",
                                    },
                                    "&:hover": {
                                        bgcolor: "#202020",
                                    },
                                    height: "100px",
                                }}
                            >
                                <TableCell align="center" sx={{ display: "flex" }} onClick={() => navigate(`/watch/${video.video_id}`)}>
                                    <img
                                        src={video.preview_url}
                                        alt="preview"
                                        style={{
                                            width: "35%",
                                            height: "35%",
                                            borderRadius: 3,
                                        }}
                                    />
                                    <Typography sx={{ display: "flex", alignItems: "center", ml: 2 }}>
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
