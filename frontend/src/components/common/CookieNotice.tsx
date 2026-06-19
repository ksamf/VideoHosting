import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { COOKIE_NOTICE_STORAGE_KEY, PRIVACY_POLICY_PATH } from "../../utils/privacy";

export default function CookieNotice() {
    const [accepted, setAccepted] = useState(() => {
        try {
            return localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === "true";
        } catch {
            return false;
        }
    });

    const handleAccept = () => {
        try {
            localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, "true");
        } catch {
            // The banner can still be dismissed if storage is unavailable.
        }
        setAccepted(true);
    };

    if (accepted) {
        return null;
    }

    return (
        <Box
            role="dialog"
            aria-label="Уведомление о cookie и localStorage"
            sx={(theme) => ({
                position: "fixed",
                left: { xs: 12, sm: 24 },
                right: { xs: 12, sm: 24 },
                bottom: { xs: 12, sm: 24 },
                zIndex: theme.zIndex.snackbar,
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                p: { xs: 1.5, sm: 2 },
            })}
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                <Typography fontSize={13} flex={1}>
                    Мы используем cookie и localStorage для авторизации, учета просмотров и работы сервиса.
                    Продолжая пользоваться сайтом, вы соглашаетесь с обработкой этих данных.{" "}
                    <Link component={RouterLink} to={PRIVACY_POLICY_PATH} color="inherit" underline="always">
                        Политика обработки персональных данных
                    </Link>
                    .
                </Typography>
                <Button variant="contained" onClick={handleAccept} sx={{ flexShrink: 0 }}>
                    Принять
                </Button>
            </Stack>
        </Box>
    );
}
