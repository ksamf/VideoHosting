import { useState, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Box, Typography, Slider } from "@mui/material";
import { videoSx } from "../../styles/theme";

type VideoSliderProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    progress: number;
    duration: number;
    buffering: boolean;
    setProgress: Dispatch<SetStateAction<number>> | ((value: number) => void);
    setCurrentTime: Dispatch<SetStateAction<number>> | ((value: number) => void);
    formatTime: (seconds: number) => string;
};

export default function VideoSlider({
    videoRef,
    progress,
    duration,
    buffering,
    setProgress,
    setCurrentTime,
    formatTime,
}: VideoSliderProps) {
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState(0);
    const [previewImg, setPreviewImg] = useState<string | null>(null);

    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleSeek = (_: Event, value: number | number[]) => {
        const video = videoRef.current;
        if (!video || !duration || !Number.isFinite(duration)) return;

        const val = Array.isArray(value) ? value[0] : value;

        const newTime = (val / 100) * duration;

        video.currentTime = newTime;
        setProgress(val);
        setCurrentTime(newTime);
    };

    return (
        <>
            {buffering && (
                <Box sx={videoSx.sliderBufferOverlay}>
                    <Box sx={videoSx.sliderSpinner} />
                </Box>
            )}

            {previewImg && hoverTime !== null && (
                <Box
                    sx={{ ...videoSx.sliderPreviewBox, left: hoverX - 80 }}
                >
                    <img
                        src={previewImg}
                        alt="preview"
                        style={videoSx.sliderPreviewImage}
                    />
                    <Typography sx={videoSx.sliderPreviewTime}>
                        {formatTime(hoverTime)}
                    </Typography>
                </Box>
            )}

                <Slider
                value={progress}
                onChange={handleSeek}
                size="small"
                sx={videoSx.slider}
                disabled={!duration}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();

                    let percent = (e.clientX - rect.left) / rect.width;
                    percent = Math.max(0, Math.min(1, percent));

                    const time = percent * duration;

                    setHoverTime(time);
                    setHoverX(e.clientX - rect.left);
                }}
                onMouseLeave={() => {
                    setHoverTime(null);
                    setPreviewImg(null);
                }}
            />

            <canvas
                ref={previewCanvasRef}
                style={videoSx.hiddenCanvas}
            />
        </>
    );
}
