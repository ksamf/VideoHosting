import { Box, Skeleton, Stack } from "@mui/material";

export default function WatchSkeleton() {
    return (
        <Stack spacing={2} sx={{
            maxWidth: 1300,
            mt: 2,
            ml: { xs: 0, md: 4 },
        }}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1300,
                    mx: "auto",
                    aspectRatio: "16 / 9",

                }}
            >
                <Skeleton
                    variant="rectangular"
                    sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 2,
                    }}
                />

            </Box>

            <Skeleton variant="text" width="80%" height={30} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="circular" width={50} height={50} />
                <Skeleton variant="text" width="10%" height={50} />
                <Box sx={{ flexGrow: 1 }} />
                <Skeleton variant="rectangular" width="10%" height={50} sx={{ borderRadius: 5 }} />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 2 }} />
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 2 }} />
        </Stack>
    );
}