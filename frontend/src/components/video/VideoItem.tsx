import CardMedia from "@mui/material/CardMedia";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ReactTimeAgo from "react-time-ago";
import ru from "javascript-time-ago/locale/ru.json";
import TimeAgo from "javascript-time-ago";
import Box from "@mui/material/Box"
import { Link } from "react-router-dom"
import UserAvatar from "../common/UserAvatar";
import { shortenNumRu } from "../../utils/ShortenNumRu";
import { formatDuration } from "../../utils/FormatDuration";
import type { Video } from "../../types/video";
import { videoSx } from "../../styles/sx/video";

TimeAgo.addLocale(ru);

type VideoItemProps = {
    video: Video;
};

export default function VideoItem({ video }: VideoItemProps) {
    const uploadDate = new Date(video.created_at);
    const duration = Number(video.duration_seconds ?? 0);
    const hasDuration = Number.isFinite(duration) && duration > 0;
    const durationLabel = hasDuration ? formatDuration(duration) : "";

    return (
        <Box sx={videoSx.cardRoot}>
            <Box component={Link} to={`/watch/${video.video_id}`} sx={videoSx.cardLink}>
                <Box sx={videoSx.cardPreviewBox}>
                    <CardMedia component="img" src={video.preview_url} sx={videoSx.cardMedia} className="video-preview" />
                    {hasDuration && (
                        <Typography component="span" sx={videoSx.cardDurationBadge}>
                            {durationLabel}
                        </Typography>
                    )}
                </Box>

                <Box sx={videoSx.cardMetaRow}>
                    <Box sx={videoSx.cardAvatarWrap}>
                        <UserAvatar username={video.username} avatar_url={video.user_avatar_url} size={36} />
                    </Box>
                    <Stack spacing={0.35} sx={videoSx.cardTextWrap}>
                        <Typography sx={videoSx.cardTitle}>
                            {video.name}
                        </Typography>
                        <Typography sx={videoSx.cardMetaText}>{video.username}</Typography>
                        <Typography sx={videoSx.cardMetaText}>
                            {shortenNumRu(video.views)} просмотров · <ReactTimeAgo date={uploadDate} locale="ru-RU" />
                        </Typography>
                    </Stack>
                    <Box sx={videoSx.cardActionIcon} aria-hidden="true">
                        <MoreVertIcon fontSize="small" />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}


