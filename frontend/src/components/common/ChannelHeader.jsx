import { Button, Paper, Stack, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import { uploadUserAvatar, getUserSubscriptionsCount, getUserViewsCount } from "../../api/users";
import SubscribeButton from "../video/SubscribeButton";
import { shortenNumRu } from "../../utils/ShortenNumRu";

export default function ChannelHeader({ channel, authUser, isAuth, countVideos, isSubscribed, setIsSubscribed }) {
    const inputRef = useRef(null);
    const isOwnChannel = authUser?.user_id === channel.user_id;
    const [avatarVersion, setAvatarVersion] = useState(0);
    const [viewsCount, setViewsCount] = useState(0);
    const [subscriptionsCount, setSubscriptionsCount] = useState(0);


    const openFileDialog = () => {
        if (authUser?.user_id === channel?.user_id) {
            inputRef.current?.click();
        }
    };
    const handleFileSelect = async (file) => {
        if (!file.type.startsWith("image/")) {
            alert("Можно загружать только изображение");
            return;
        }
        if (!authUser?.user_id || authUser.user_id !== channel?.user_id) {
            return;
        }
        await uploadUserAvatar(authUser.user_id, file);
        setAvatarVersion(Date.now());
    };
    useEffect(() => {
        if (!channel?.user_id) return;
        let isActive = true;

        Promise.all([
            getUserSubscriptionsCount(channel.user_id),
            getUserViewsCount(channel.user_id),
        ])
            .then(([subsData, viewsData]) => {
                if (!isActive) return;
                setSubscriptionsCount(subsData?.subscriptions ?? 0);
                setViewsCount(viewsData?.subscriptions ?? 0);
            })
            .catch(() => {
                if (!isActive) return;
                setSubscriptionsCount(0);
                setViewsCount(0);
            });

        return () => {
            isActive = false;
        };
    }, [channel?.user_id])
    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                }}
            />
            <Paper
                sx={(theme) => ({
                    p: 2,
                    width: { xs: "100%", md: 280 },
                    bgcolor: "transparent",
                    boxShadow: "none",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    position: { md: "sticky" },
                    top: 80,
                })}
            >
                <Stack alignItems="center" spacing={1}>
                    <Button
                        onClick={openFileDialog}
                        disabled={authUser?.user_id !== channel.user_id}
                        sx={{ borderRadius: "50%", minWidth: 0, p: 0.5 }}
                    >
                        <UserAvatar
                            username={channel.username}
                            avatar_url={channel.avatar_url}
                            size={96}
                            cacheKey={avatarVersion}
                        />
                    </Button>
                    <Typography fontWeight={600} fontSize={18}>
                        {channel.username}
                    </Typography>
                </Stack>

                {isAuth && !isOwnChannel && (
                    <SubscribeButton channelId={channel.user_id} setSubscriptionsCount={setSubscriptionsCount} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} />
                )}

                <Typography sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    Подписчиков: {shortenNumRu(subscriptionsCount)}
                </Typography>
                <Typography sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    Видео: {countVideos}
                </Typography>
                <Typography sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    Просмотров: {shortenNumRu(viewsCount)}
                </Typography>
            </Paper>
        </>
    )
}
