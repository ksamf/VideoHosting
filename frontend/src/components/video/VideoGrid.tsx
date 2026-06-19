import { Box } from "@mui/material";
import VideoItem from "./VideoItem";
import type { Video } from "../../types/video";
import { videoSx } from "../../styles/sx/video";

type VideoGridProps = {
    videos: Video[];
};

export default function VideoGrid({ videos }: VideoGridProps) {
    return (
        <Box sx={videoSx.gridRoot}>
            {videos.map((video) => (
                <VideoItem key={video.video_id} video={video} />
            ))}
        </Box>
    );
}
