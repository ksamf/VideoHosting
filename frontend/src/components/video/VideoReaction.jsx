import { useState, useEffect, useRef } from "react";
import { Divider, IconButton, Stack, Typography } from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import { shortenNumRu } from "../../utils/ShortenNumRu";
import { addReaction, getReaction } from "../../api/videos";

export default function VideoReaction({ video, isAuth }) {
    const [reactionLoading, setReactionLoading] = useState(false);
    const [like, setLike] = useState(false);
    const [dislike, setDislike] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(video.likes);
    const [currentDislikes, setCurrentDislikes] = useState(video.dislikes);
    const sendTimerRef = useRef(null);

    useEffect(() => {
        setCurrentLikes(video.likes);
        setCurrentDislikes(video.dislikes);
        setLike(false);
        setDislike(false);
    }, [video.video_id, video.likes, video.dislikes]);

    useEffect(() => {
        return () => {
            if (sendTimerRef.current) {
                clearTimeout(sendTimerRef.current);
            }
        };
    }, []);

    const scheduleReaction = (value, onFail) => {
        if (sendTimerRef.current) {
            clearTimeout(sendTimerRef.current);
        }
        sendTimerRef.current = setTimeout(async () => {
            try {
                await addReaction(video.video_id, value);
            } catch (err) {
                console.log(err)
                onFail?.();
            } finally {
                setReactionLoading(false);
            }
        }, 1000);
    };

    const handleLike = async () => {
        if (reactionLoading) return;
        const prev = {
            like,
            dislike,
            likes: currentLikes,
            dislikes: currentDislikes,
        };

        let nextLike = like;
        let nextDislike = dislike;
        let nextLikes = currentLikes;
        let nextDislikes = currentDislikes;

        if (like) {
            nextLike = false;
            nextLikes = Math.max(0, currentLikes - 1);
        } else {
            nextLike = true;
            nextLikes = currentLikes + 1;
            if (dislike) {
                nextDislike = false;
                nextDislikes = Math.max(0, currentDislikes - 1);
            }
        }

        setReactionLoading(true);
        setLike(nextLike);
        setDislike(nextDislike);
        setCurrentLikes(nextLikes);
        setCurrentDislikes(nextDislikes);
        scheduleReaction(nextLike ? "like" : "", () => {
            setLike(prev.like);
            setDislike(prev.dislike);
            setCurrentLikes(prev.likes);
            setCurrentDislikes(prev.dislikes);
        });
    };
    const handleDislike = async () => {
        if (reactionLoading) return;
        const prev = {
            like,
            dislike,
            likes: currentLikes,
            dislikes: currentDislikes,
        };

        let nextLike = like;
        let nextDislike = dislike;
        let nextLikes = currentLikes;
        let nextDislikes = currentDislikes;

        if (dislike) {
            nextDislike = false;
            nextDislikes = Math.max(0, currentDislikes - 1);
        } else {
            nextDislike = true;
            nextDislikes = currentDislikes + 1;
            if (like) {
                nextLike = false;
                nextLikes = Math.max(0, currentLikes - 1);
            }
        }
        setReactionLoading(true);
        setLike(nextLike);
        setDislike(nextDislike);
        setCurrentLikes(nextLikes);
        setCurrentDislikes(nextDislikes);
        scheduleReaction(nextDislike ? "dislike" : "", () => {
            setLike(prev.like);
            setDislike(prev.dislike);
            setCurrentLikes(prev.likes);
            setCurrentDislikes(prev.dislikes);
        });
    };
    useEffect(() => {
        if (!video?.video_id || !isAuth) {
            setLike(false);
            setDislike(false);
            return;
        }

        getReaction(video.video_id)
            .then((data) => {
                if (data?.reaction === "like") {
                    setLike(true);
                    setDislike(false);
                } else if (data?.reaction === "dislike") {
                    setDislike(true);
                    setLike(false);
                } else {
                    setLike(false);
                    setDislike(false);
                }
            })
            .catch(() => {
                setLike(false);
                setDislike(false);
            });
    }, [video?.video_id, isAuth]);

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                bgcolor: (theme) => theme.palette.background.surface,
                borderRadius: 5,
                px: 1,
                py: 0.5,
            }
            }
        >
            <IconButton sx={(theme) => ({ color: theme.palette.text.primary })} disabled={!isAuth} onClick={handleLike}>
                {like ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpAltOutlinedIcon fontSize="small" />}
                <Typography fontSize={13} ml={0.5}>
                    {shortenNumRu(currentLikes)}
                </Typography>
            </IconButton>

            <Divider
                orientation="vertical"
                flexItem
                sx={(theme) => ({ borderColor: theme.palette.divider })}
            />

            <IconButton sx={(theme) => ({ color: theme.palette.text.primary })} disabled={!isAuth} onClick={handleDislike}>
                {dislike ? <ThumbDownAltIcon fontSize="small" /> : <ThumbDownAltOutlinedIcon fontSize="small" />}
                <Typography fontSize={13} ml={0.5}>
                    {shortenNumRu(currentDislikes)}
                </Typography>
            </IconButton>
        </Stack>
    )
}
