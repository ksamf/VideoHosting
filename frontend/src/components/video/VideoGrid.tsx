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
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(auto-fill, minmax(260px, 1fr))",
                    xl: "repeat(auto-fill, minmax(280px, 1fr))",
                },
                gap: { xs: 1.5, sm: 2, md: 2.5 },
                p: { xs: 0.5, sm: 1, md: 2 },
                justifyItems: "center",
                width: "100%",
            }}
        >
            {videos.map((video) => (
                <VideoItem key={video.video_id} video={video} />
            ))}
        </Box>
    );
}
