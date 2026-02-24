import { Box, Skeleton } from "@mui/material";

type HomeSkeletonProps = {
    items?: number;
};

export default function VideoGridSkeleton({ items = 10 }: HomeSkeletonProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(auto-fill, minmax(280px, 1fr))",
                },
                gap: 2.5,
                p: 2,
                justifyItems: "center",
                width: "100%",
            }}
        >
            {Array.from({ length: items }).map((_, index) => (
                <Box key={index} sx={{ width: "100%", minWidth: { xs: 0, sm: 280 }, maxWidth: 320 }}>
                    <Box sx={{ position: "relative", width: "100%", pt: "56.25%", borderRadius: 2, overflow: "hidden" }}>
                        <Skeleton variant="rounded" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                    </Box>
                    <Box sx={{ mt: 1.5, display: "flex", gap: 1.5 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="92%" height={20} />
                            <Skeleton variant="text" width="65%" height={18} />
                            <Skeleton variant="text" width="55%" height={16} />
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
