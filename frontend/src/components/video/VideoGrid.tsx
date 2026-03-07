import { Box } from "@mui/material";
import VideoItem from "./VideoItem";
import type { Video } from "../../types/video";

type VideoGridProps = {
    videos: Video[];
};

export default function VideoGrid({ videos }: VideoGridProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(auto-fill, minmax(280px, 1fr))",
                },
                gap: 2.5,
                padding: 2,
                justifyItems: "center",
            }}
        >
            {videos.map((video) => (
                <VideoItem key={video.video_id} video={video} />
            ))}
        </Box>
    );
}
