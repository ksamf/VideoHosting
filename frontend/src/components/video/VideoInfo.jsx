import {
    Button,
    Typography,
    Stack,
    Box,
} from "@mui/material";

import ru from "javascript-time-ago/locale/ru.json";
import TimeAgo from "javascript-time-ago";
import UserAvatar from "../common/UserAvatar";
import { shortenNumRu } from "../../utils/ShortenNumRu";
import VideoReaction from "./VideoReaction";
import VideoComments from "./VideoComments";
import VideoDescription from "./VideoDescription";
import { useEffect, useState } from "react";
import { getUserSubscriptionsCount } from "../../api/users";
import SubscribeButton from "./SubscribeButton";
import { Link } from "react-router-dom";

TimeAgo.addLocale(ru);

export default function VideoInfo({ video, channel, user, isAuth }) {
    const [subscriptionsCount, setSubscriptionsCount] = useState(channel?.subscribers || 0);


    useEffect(() => {
        if (!channel?.user_id) return;

        getUserSubscriptionsCount(channel?.user_id)
            .then((data) => {
                setSubscriptionsCount(data.subscriptions);
            });

    }, [channel?.user_id]);

    if (!video || !channel) {
        return null;
    }
    return (
        <Box
            sx={{
                maxWidth: 1200,
                width: "100%",
                mt: 2,
                px: 1,
            }}
        >
            <Typography color="white" fontSize={22} fontWeight={600} mb={1}>
                {video.name}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
                <Stack direction="row" alignItems="center">
                    <Button component={Link} to={`/channel/${channel.user_id}`} sx={{ p: 0, "&:hover": { backgroundColor: 'transparent' } }} >
                        <UserAvatar
                            username={channel.username}
                            avatar_url={channel.avatar_url}
                        />
                        <Stack>
                            <Typography color="white" fontSize={14} fontWeight={500} sx={{ ml: 1 }}>
                                {channel.username}
                            </Typography>
                            <Typography color="#aaa" fontSize={12} sx={{ ml: 1 }}>
                                {shortenNumRu(subscriptionsCount || 0)} подписчиков
                            </Typography>
                        </Stack>
                    </Button>
                    {isAuth && user.user_id !== channel.user_id && (
                        <SubscribeButton channelId={channel.user_id} setSubscriptionsCount={setSubscriptionsCount} />
                    )}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                <VideoReaction video={video} isAuth={isAuth} />
            </Stack>

            <VideoDescription video={video} />
            <VideoComments video={video} user={user} isAuth={isAuth} />
        </Box >
    );
}
