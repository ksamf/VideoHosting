import { Box, Stack, Skeleton } from "@mui/material";
import VideoGridSkeleton from "./VideoGridSkeleton";
import { pageSx, skeletonSx } from "../styles/theme";

export default function ChannelSkeleton() {
    return (
        <>
            <Box sx={pageSx.channelContainer}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems="flex-start"
                >
                    <Skeleton variant="rectangular" sx={skeletonSx.channelSidebarRect} />
                    <Stack sx={pageSx.channelContent}>
                        <Stack sx={pageSx.channelSortRow}>
                            <Skeleton variant="rectangular" sx={skeletonSx.channelSortRowItem} />
                            <Skeleton variant="rectangular" sx={skeletonSx.channelSortRowItem} />
                            <Skeleton variant="rectangular" sx={skeletonSx.channelSortRowItem} />
                        </Stack>

                        <VideoGridSkeleton items={10} />
                    </Stack>
                </Stack>
            </Box>
        </>
    )
}
