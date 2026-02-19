import { useEffect, useState } from "react";
import { getUserSubscribed, subUnsubChannel } from "../../api/users";
import { Button } from "@mui/material";

export default function SubscribeButton({ channelId, setSubscriptionsCount }) {
    const [subscribeLoading, setSubscribeLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = async () => {
        if (subscribeLoading) return;

        setSubscribeLoading(true);

        try {
            const action = isSubscribed ? "unsub" : "sub";
            await subUnsubChannel(channelId, action);

            setIsSubscribed(!isSubscribed);

            setSubscriptionsCount((prev) =>
                isSubscribed ? prev - 1 : prev + 1
            );
        } catch (e) {
            console.error("subscribe error", e);
        } finally {
            setSubscribeLoading(false);
        }
    };
    useEffect(() => {
        getUserSubscribed(channelId)
            .then((data) => {
                setIsSubscribed(data.is_subscribed)
            })
    }, [channelId])
    return (
        <>
            {isSubscribed ?
                <Button
                    variant="contained"
                    size="small"
                    disabled={subscribeLoading}
                    onClick={handleSubscribe}
                    sx={{
                        ml: 1,
                        bgcolor: "#555",
                        "&:hover": { bgcolor: "#444" },
                        borderRadius: 5,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#777"
                    }}
                >
                    Отписаться
                </Button>
                :
                <Button
                    variant="contained"
                    size="small"
                    disabled={subscribeLoading}
                    onClick={handleSubscribe}
                    sx={{
                        ml: 1,
                        bgcolor: "#fff",
                        "&:hover": { bgcolor: "#aaa" },
                        borderRadius: 5,
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    Подписаться
                </Button>
            }
        </>
    )
}