import { Box, Stack, Paper, Skeleton } from "@mui/material";
import VideoGridSkeleton from "./VideoGridSkeleton";
import { pageSx } from "../styles/theme";

export default function ChannelSkeleton() {
    return (
        <>
            <Box sx={pageSx.channelContainer}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems="flex-start"
                >

                    <Skeleton variant="rectangular" sx={{ p: 2, width: { xs: "100%", md: 280 }, height: 300, borderRadius: 3 }} />
                    <Stack sx={pageSx.channelContent}>
                        <Stack sx={pageSx.channelSortRow}>
                            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 3 }} />
                            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 3 }} />
                            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 3 }} />
                        </Stack>

                        <VideoGridSkeleton items={10} />
                    </Stack>
                </Stack>
            </Box>
        </>
    )
}