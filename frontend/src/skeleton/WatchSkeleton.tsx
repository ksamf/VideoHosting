import { Box, Skeleton, Stack } from "@mui/material";
import { skeletonSx } from "../styles/theme";

export default function WatchSkeleton() {
    return (
        <Stack spacing={2} sx={skeletonSx.watchRoot}>
            <Box sx={skeletonSx.watchFrame}>
                <Skeleton
                    variant="rectangular"
                    sx={skeletonSx.watchPlayerRect}
                />
            </Box>

            <Skeleton variant="text" width="80%" height={30} />
            <Box sx={skeletonSx.watchChannelRow}>
                <Skeleton variant="circular" width={50} height={50} />
                <Skeleton variant="text" sx={skeletonSx.watchTextButton} />
                <Box sx={skeletonSx.watchGrow} />
                <Skeleton variant="rectangular" sx={skeletonSx.watchButton} />
            </Box>
            <Skeleton variant="rectangular" sx={skeletonSx.watchDescriptionBlock} />
            <Skeleton variant="text" sx={skeletonSx.watchCommentTitle} />
            <Skeleton variant="rectangular" sx={skeletonSx.watchDescriptionBlock} />
        </Stack>
    );
}
