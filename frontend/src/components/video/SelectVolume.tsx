import { Box, Slider } from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { videoSx } from "../../styles/theme";

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
                sx={videoSx.volumeRoot}
            >
                {volume === 0 ? (
                    <VolumeOffIcon sx={videoSx.volumeIcon} />
                ) : (
                    <VolumeUpIcon sx={videoSx.volumeIcon} />
                )}
                <Box
                    sx={videoSx.volumePopover(hoveredVolume)}
                >
                    <Slider
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={handleVolume}
                        size="small"
                        sx={videoSx.volumeSlider}
                    />
                </Box>
            </Box>
        </>
    )
}
