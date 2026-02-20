import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ReactTimeAgo from "react-time-ago";
import ru from "javascript-time-ago/locale/ru.json";
import TimeAgo from "javascript-time-ago";
import Box from "@mui/material/Box"
import { CardActionArea } from "@mui/material";
import { Link } from 'react-router-dom'
import UserAvatar from "../common/UserAvatar";
import { shortenNumRu } from "../../utils/ShortenNumRu";
import type { Video } from "../../types/video";
import { videoSx } from "../../styles/theme";

TimeAgo.addLocale(ru);

type VideoItemProps = {
    video: Video;
};

export default function VideoItem({ video }: VideoItemProps) {
    const uploadDate = new Date(video.created_at);
    return (
        <Card
            sx={videoSx.cardRoot}
        >
            <CardActionArea component={Link} to={{ pathname: `/watch/${video.video_id}` }} >
                <Box sx={videoSx.cardPreviewBox}>
                    <CardMedia
                        component="img"
                        src={video.preview_url}
                        sx={videoSx.cardMedia}
                    />
                </Box>

                <CardHeader
                    sx={videoSx.cardHeader}
                    avatar={
                        <IconButton sx={videoSx.cardAvatarButton}>
                            <UserAvatar username={video.username} avatar_url={video.user_avatar_url} />
                        </IconButton>
                    }
                    action={
                        <IconButton aria-label="settings" sx={videoSx.cardActionIcon}>
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={
                        <Typography
                            fontSize={15}
                            color="white"
                            sx={videoSx.cardTitle}
                        >
                            {video.name}
                        </Typography>
                    }
                    subheader={
                        <Stack spacing={0.3}>
                            <Typography fontSize={12} sx={videoSx.cardMetaText}>
                                {video.username}
                            </Typography>
                            <Typography fontSize={12} sx={videoSx.cardMetaText}>
                                {shortenNumRu(video.views)} просмотров ·{" "}
                                <ReactTimeAgo date={uploadDate} locale="ru-RU" />
                            </Typography>
                        </Stack>
                    }
                />
            </CardActionArea >
        </Card>
    );
}
