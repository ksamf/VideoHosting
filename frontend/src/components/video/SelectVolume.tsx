import { Box, Slider } from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import type { Dispatch, RefObject, SetStateAction } from "react";

type SelectVolumeProps = {
    volume: number;
    setVolume: Dispatch<SetStateAction<number>>;
    videoRef: RefObject<HTMLVideoElement | null>;
    hoveredVolume: boolean;
    setHoveredVolume: Dispatch<SetStateAction<boolean>>;
};

export default function SelectVolume({
    volume,
    setVolume,
    videoRef,
    hoveredVolume,
    setHoveredVolume,
}: SelectVolumeProps) {
    const handleVolume = (_: Event, value: number | number[]) => {
        const video = videoRef.current;
        if (!video) return;
        const nextValue = Array.isArray(value) ? value[0] : value;

        video.volume = nextValue;
        setVolume(nextValue);
    };
    return (
        <>
            <Box
                onMouseEnter={() => setHoveredVolume(true)}
                onMouseLeave={() => setHoveredVolume(false)}
                sx={{ position: "relative", display: "flex", alignItems: "center" }}
            >
                {volume === 0 ? (
                    <VolumeOffIcon sx={{ color: "#fff" }} />
                ) : (
                    <VolumeUpIcon sx={{ color: "#fff" }} />
                )}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "120%",
                        left: "50%",
                        transform: hoveredVolume
                            ? "translateX(10%) translateY(40px)"
                            : "translateX(0%) translateY(40px)",
                        opacity: hoveredVolume ? 1 : 0,
                        pointerEvents: hoveredVolume ? "auto" : "none",
                        transition: "all 0.2s ease",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                    }}
                >
                    <Slider
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={handleVolume}
                        size="small"
                        sx={{
                            width: 100,
                            color: "#fff",
                        }}
                    />
                </Box>
            </Box>
        </>
    )
}
