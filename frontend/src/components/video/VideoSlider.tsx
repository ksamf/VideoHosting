import { useState, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Box, Typography, Slider } from "@mui/material";

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
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(0,0,0,0.3)",
                        zIndex: 2,
                        pointerEvents: "none",
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            border: "4px solid rgba(255,255,255,0.3)",
                            borderTop: (theme) => `4px solid ${theme.palette.text.primary}`,
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                        }}
                    />
                </Box>
            )}

            {previewImg && hoverTime !== null && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "70px",
                        left: hoverX - 80,
                        bgcolor: (theme) => theme.palette.common.black,
                        borderRadius: 1,
                        overflow: "hidden",
                        p: 0.5,
                        pointerEvents: "none",
                    }}
                >
                    <img
                        src={previewImg}
                        alt="preview"
                        style={{ width: 160, display: "block" }}
                    />
                    <Typography
                        sx={{
                            color: (theme) => theme.palette.text.primary,
                            fontSize: 11,
                            textAlign: "center",
                            mt: 0.3,
                        }}
                    >
                        {formatTime(hoverTime)}
                    </Typography>
                </Box>
            )}

            <Slider
                value={progress}
                onChange={handleSeek}
                size="small"
                sx={(theme) => ({ color: theme.palette.text.primary })}
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
                style={{ display: "none" }}
            />
        </>
    );
}
