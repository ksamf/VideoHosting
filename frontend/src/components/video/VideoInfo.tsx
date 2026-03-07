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
import type { VideoDetails } from "../../types/video";
import type { User } from "../../types/user";
import { videoSx } from "../../styles/sx/video";

TimeAgo.addLocale(ru);

type VideoInfoProps = {
    video: VideoDetails;
    channel: User;
    user: User | null;
    isAuth: boolean;
};

export default function VideoInfo({ video, channel, user, isAuth }: VideoInfoProps) {
    const [subscriptionsCount, setSubscriptionsCount] = useState<number>(0);


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
            sx={videoSx.videoInfoContainer}
        >
            <Typography color="text.primary" fontSize={{ xs: 18, sm: 22 }} fontWeight={600} mb={1}>
                {video.name}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                    <Button component={Link} to={`/channel/${channel.user_id}`} sx={videoSx.videoInfoChannelButton} >
                        <UserAvatar
                            username={channel.username}
                            avatar_url={channel.avatar_url}
                        />
                        <Stack>
                            <Typography color="text.primary" fontSize={14} fontWeight={500} sx={videoSx.videoInfoChannelText}>
                                {channel.username}
                            </Typography>
                            <Typography fontSize={12} sx={videoSx.videoInfoSubsText}>
                                {shortenNumRu(subscriptionsCount || 0)} подписчиков
                            </Typography>
                        </Stack>
                    </Button>
                    {isAuth && user?.user_id !== channel.user_id && (
                        <SubscribeButton channelId={channel.user_id} setSubscriptionsCount={setSubscriptionsCount} />
                    )}
                </Stack>

                <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
                    <VideoReaction video={video} isAuth={isAuth} />
                </Box>
            </Stack>

            <VideoDescription video={video} />
            <VideoComments video={video} user={user} isAuth={isAuth} />
        </Box >
    );
}

