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

TimeAgo.addLocale(ru);

type VideoItemProps = {
    video: Video;
};

export default function VideoItem({ video }: VideoItemProps) {
    const uploadDate = new Date(video.created_at);
    return (
        <Card
            sx={(theme) => ({
                width: "100%",
                maxWidth: 360,
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": { boxShadow: "0 12px 24px rgba(0,0,0,0.6)" },
            })}
        >
            <CardActionArea component={Link} to={{ pathname: `/watch/${video.video_id}` }} >
                <Box
                    sx={(theme) => ({
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16 / 9",
                        overflow: "hidden",
                        backgroundColor: theme.palette.common.black,
                    })}
                >
                    <CardMedia
                        component="img"
                        src={video.preview_url}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.25s ease",
                            ".MuiCard-root:hover &": {
                            },
                        }}
                    />
                </Box>

                <CardHeader
                    sx={{ p: 1.5, textAlign: "left" }}
                    avatar={
                        <IconButton sx={{ p: 0 }}>
                            <UserAvatar username={video.username} avatar_url={video.user_avatar_url} />
                        </IconButton>
                    }
                    action={
                        <IconButton aria-label="settings" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={
                        <Typography
                            fontSize={15}
                            color="white"
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.3,
                            }}
                        >
                            {video.name}
                        </Typography>
                    }
                    subheader={
                        <Stack spacing={0.3}>
                            <Typography fontSize={12} sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                {video.username}
                            </Typography>
                            <Typography fontSize={12} sx={(theme) => ({ color: theme.palette.text.secondary })}>
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
