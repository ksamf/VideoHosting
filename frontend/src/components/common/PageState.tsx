import { Typography } from "@mui/material";

export function PageLoading({ sx = {} }) {
    return (
        <Typography sx={{ color: "text.secondary", px: 2, py: 1, ...sx }}>
            Загрузка...
        </Typography>
    );
}

export function PageError({ error, sx = {} }) {
    if (!error) return null;
    return (
        <Typography color="error" sx={{ px: 2, py: 1, ...sx }}>
            {error}
        </Typography>
    );
}
