import { Box, Stack, Skeleton } from "@mui/material";
import VideoGridSkeleton from "./VideoGridSkeleton";
import { pageSx } from "../styles/sx/page";
import { skeletonSx } from "../styles/sx/skeleton";

export default function ChannelSkeleton() {
    return (
        <>
            <Box sx={pageSx.channelContainer}>
                <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={{ xs: 1.5, sm: 2 }}
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

