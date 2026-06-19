import { Box, Skeleton } from "@mui/material";
import { skeletonSx } from "../styles/sx/skeleton";

type HomeSkeletonProps = {
    items?: number;
};

export default function VideoGridSkeleton({ items = 10 }: HomeSkeletonProps) {
    return (
        <Box sx={skeletonSx.videoGrid}>
            {Array.from({ length: items }).map((_, index) => (
                <Box key={index} sx={skeletonSx.videoCard}>
                    <Box sx={skeletonSx.videoPreviewWrap}>
                        <Skeleton variant="rounded" sx={skeletonSx.videoPreview} />
                    </Box>
                    <Box sx={skeletonSx.videoMetaRow}>
                        <Skeleton variant="circular" width={36} height={36} />
                        <Box sx={skeletonSx.videoMetaTextCol}>
                            <Skeleton variant="text" width="92%" height={20} />
                            <Skeleton variant="text" width="65%" height={18} />
                            <Skeleton variant="text" width="55%" height={16} />
                        </Box>
                        <Skeleton variant="circular" sx={skeletonSx.videoMetaAction} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

