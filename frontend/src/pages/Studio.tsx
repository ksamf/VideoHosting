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
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getUserSubscriptionsCount, getUserVideos, getUserViewsCount } from "../api/users";
import { deleteVideo } from "../api/videos";
import { formattedDate } from "../utils/FormattedDate";
import { Stack } from "@mui/material";
import useFetch from "../hooks/useFetch";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/sx/page";
import StudioSkeleton from "../skeleton/StudioSkeleton";
import { useMediaQuery, useTheme } from "@mui/material";
import type { VideoDetails } from "../types/video";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

type StudioStatusMeta = {
    label: string;
    kind: "error" | "processing" | "done";
};

function getStudioStatusMeta(status?: string): StudioStatusMeta {
    const normalized = String(status ?? "").toLowerCase();

    if (normalized === "failed" || normalized === "error") {
        return { label: "Ошибка", kind: "error" };
    }
    if (normalized === "processing" || normalized === "uploading") {
        return { label: "В обработке", kind: "processing" };
    }
    return { label: "Загрузка завершена", kind: "done" };
}

function StudioStatus({ status }: { status?: string }) {
    const meta = getStudioStatusMeta(status);
    const icon =
        meta.kind === "error" ? (
            <ErrorOutlineRoundedIcon sx={pageSx.studioStatusErrorIcon} />
        ) : meta.kind === "processing" ? (
            <AutorenewRoundedIcon sx={pageSx.studioStatusProcessingIcon} />
        ) : (
            <CheckCircleRoundedIcon sx={pageSx.studioStatusDoneIcon} />
        );

    return (
        <Tooltip title={meta.label}>
            <Box component="span" sx={pageSx.studioStatusCell}>
                {icon}
            </Box>
        </Tooltip>
    );
}

function buildStatusSignature(videos: Array<{ video_id: string; status?: string }>): string {
    return videos
        .map((video) => `${video.video_id}:${String(video.status ?? "").toLowerCase()}`)
        .sort()
        .join("|");
}

export default function Studio() {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.user_id ?? null;
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
    const [userVideos, setUserVideos] = useState<VideoDetails[]>([]);
    const [userVideoLoading, setUserVideoLoading] = useState<boolean>(true);
    const [userVideoError, setUserVideoError] = useState<string | null>(null);
    const statusSignatureRef = useRef<string>("");

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
    const loadUserVideos = useCallback(
        async (options?: { onlyIfStatusChanged?: boolean; showLoading?: boolean }) => {
            const onlyIfStatusChanged = options?.onlyIfStatusChanged ?? false;
            const showLoading = options?.showLoading ?? false;

            if (!userId) {
                setUserVideos([]);
                setUserVideoError(null);
                setUserVideoLoading(false);
                statusSignatureRef.current = "";
                return;
            }

            if (showLoading) {
                setUserVideoLoading(true);
            }

            try {
                const result = await getUserVideos(userId);
                const nextVideos = Array.isArray(result) ? result : [];
                const nextStatusSignature = buildStatusSignature(nextVideos);

                if (!onlyIfStatusChanged || nextStatusSignature !== statusSignatureRef.current) {
                    setUserVideos(nextVideos);
                    statusSignatureRef.current = nextStatusSignature;
                }
                setUserVideoError(null);
            } catch (err: unknown) {
                setUserVideoError(err instanceof Error ? err.message : "Ошибка загрузки видео");
            } finally {
                if (showLoading) {
                    setUserVideoLoading(false);
                }
            }
        },
        [userId]
    );

    const bestVideo = userVideos.length > 0 ? [...userVideos].sort((a, b) => b.views - a.views)[0] : null;
    const hasPendingVideos = userVideos.some((video) => getStudioStatusMeta(video.status).kind === "processing");

    const loading =
        subscriptionsCountPeriodLoading ||
        userViewsCountLoading ||
        userViewsCountPeriodLoading ||
        userVideoLoading ||
        authLoading;
    const error = subscriptionsCountPeriodError || userViewsCountError || userViewsCountPeriodError || userVideoError;

    const handleDeleteVideo = async (videoId: string, videoName: string) => {
        const confirmed = window.confirm(`Удалить видео "${videoName}"?`);
        if (!confirmed) return;

        setDeletingVideoId(videoId);
        try {
            await deleteVideo(videoId);
            await loadUserVideos({ showLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Не удалось удалить видео";
            alert(message);
        } finally {
            setDeletingVideoId(null);
        }
    };

    useEffect(() => {
        void loadUserVideos({ showLoading: true });
    }, [loadUserVideos]);

    useEffect(() => {
        if (!hasPendingVideos) return;
        const id = window.setInterval(() => {
            void loadUserVideos({ onlyIfStatusChanged: true, showLoading: false });
        }, 5000);
        return () => window.clearInterval(id);
    }, [hasPendingVideos, loadUserVideos]);

    if (loading) {
        return <StudioSkeleton />;
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
                        <Typography fontSize={{ xs: 20, sm: 22 }} fontWeight={600}>
                            {user?.subscriptions ?? 0} +{subscriptionsCountPeriod?.subscriptions ?? 0}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={pageSx.studioCard}>
                        <Typography sx={pageSx.studioCardLabel}>
                            Просмотров за 30 дней
                        </Typography>
                        <Typography fontSize={{ xs: 20, sm: 22 }} fontWeight={600}>
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
                                <Box
                                    component="img"
                                    src={bestVideo.preview_url}
                                    alt="preview"
                                    sx={pageSx.studioBestVideoImage}
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

            {isMobile ? (
                <Stack sx={pageSx.studioMobileList}>
                    {userVideos.map((video) => (
                        <Box
                            key={video.video_id}
                            sx={pageSx.studioMobileCard}
                            onClick={() => navigate(`/watch/${video.video_id}`)}
                        >
                            <Box
                                component="img"
                                src={video.preview_url}
                                alt="preview"
                                sx={pageSx.studioMobileThumb}
                            />
                            <Box sx={pageSx.studioMobileMeta}>
                                <Typography fontSize={14} fontWeight={600} noWrap>
                                    {video.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formattedDate(video.created_at)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {video.views} просмотров
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {video.likes} / {video.dislikes}
                                </Typography>
                                <StudioStatus status={video.status} />
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={deletingVideoId === video.video_id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDeleteVideo(video.video_id, video.name);
                                    }}
                                    sx={pageSx.studioDeleteIcon}
                                >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={pageSx.studioTableContainer}
                >
                    <Table sx={pageSx.studioTable}>
                        <TableHead>
                            <TableRow sx={pageSx.studioTableHeadRow}>
                                <TableCell align="center">Видео</TableCell>
                                <TableCell align="center">Дата</TableCell>
                                <TableCell align="center">Просмотры</TableCell>
                                <TableCell align="center">Комментарии</TableCell>
                                <TableCell align="center">Лайки / Дизлайки</TableCell>
                                <TableCell align="center">Статус</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {userVideos.map((video) => (
                                <TableRow
                                    key={video.video_id}
                                    sx={pageSx.studioTableRow}
                                >
                                    <TableCell align="left" sx={pageSx.studioVideoCell} onClick={() => navigate(`/watch/${video.video_id}`)}>
                                        <Box sx={pageSx.studioVideoCellContent}>
                                            <Box
                                                component="img"
                                                src={video.preview_url}
                                                alt="preview"
                                                sx={pageSx.studioVideoImage}
                                            />
                                            <Typography sx={pageSx.studioVideoName}>
                                                {video.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formattedDate(video.created_at)}</TableCell>
                                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{video.views}</TableCell>
                                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{video.comment_count}</TableCell>
                                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                                        {video.likes} / {video.dislikes}
                                    </TableCell>
                                    <TableCell align="center">
                                        <StudioStatus status={video.status} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Удалить видео">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    disabled={deletingVideoId === video.video_id}
                                                    onClick={() => void handleDeleteVideo(video.video_id, video.name)}
                                                    sx={pageSx.studioDeleteIcon}
                                                >
                                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Outlet />
        </Box>
    );
}
