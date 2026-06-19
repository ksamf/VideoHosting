import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { getUserSubscribed, subUnsubChannel } from "../../api/users";
import { Button } from "@mui/material";

type SubscribeButtonProps = {
    channelId: string;
    setSubscriptionsCount?: Dispatch<SetStateAction<number>>;
};

export default function SubscribeButton({ channelId, setSubscriptionsCount }: SubscribeButtonProps) {
    const [subscribeLoading, setSubscribeLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = async () => {
        if (subscribeLoading) return;

        setSubscribeLoading(true);

        try {
            const action = isSubscribed ? "unsub" : "sub";
            await subUnsubChannel(channelId, action);

            setIsSubscribed(!isSubscribed);

            setSubscriptionsCount?.((prev) =>
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
                setIsSubscribed(data.is_subscribed);
            })
            .catch(() => {
                setIsSubscribed(false);
            });
    }, [channelId]);
    return (
        <>
            {isSubscribed ?
                <Button
                    variant="outlined"
                    size="small"
                    disabled={subscribeLoading}
                    onClick={handleSubscribe}
                    sx={(theme) => ({
                        ml: { xs: 0, sm: 1 },
                        mt: { xs: 0.5, sm: 0 },
                        bgcolor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        "&:hover": {
                            bgcolor: theme.palette.action.hover,
                            borderColor: theme.palette.text.secondary,
                        },
                        borderRadius: 5,
                        textTransform: "none",
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                    })}
                >
                    Отписаться
                </Button>
                :
                <Button
                    variant="contained"
                    size="small"
                    disabled={subscribeLoading}
                    onClick={handleSubscribe}
                    sx={(theme) => ({
                        ml: { xs: 0, sm: 1 },
                        mt: { xs: 0.5, sm: 0 },
                        bgcolor: theme.palette.text.primary,
                        "&:hover": { bgcolor: theme.palette.text.secondary },
                        borderRadius: 5,
                        textTransform: "none",
                        fontWeight: 600,
                        color: theme.palette.background.default,
                    })}
                >
                    Подписаться
                </Button>
            }
        </>
    )
}
