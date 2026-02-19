import { Box } from "@mui/material";
import VideoItem from "./VideoItem";

export default function VideoGrid({ videos }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                    xl: "repeat(5, 1fr)",
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
