import { Typography } from "@mui/material";


export function PageError({ error, sx = {} }) {
    if (!error) return null;
    return (
        <Typography color="error" sx={{ px: 2, py: 1, ...sx }}>
            {error}
        </Typography>
    );
}
