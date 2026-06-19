import { Box, Slider, useMediaQuery, useTheme } from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import type { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";
import { videoSx } from "../../styles/sx/video";

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleVolume = (_: Event, value: number | number[]) => {
        const video = videoRef.current;
        if (!video) return;
        const nextValue = Array.isArray(value) ? value[0] : value;

        video.volume = nextValue;
        setVolume(nextValue);
    };

    const handlePopoverClick = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    return (
        <>
            <Box
                onMouseEnter={isMobile ? undefined : () => setHoveredVolume(true)}
                onMouseLeave={isMobile ? undefined : () => setHoveredVolume(false)}
                onClick={() => setHoveredVolume((v) => !v)}
                aria-label="Громкость"
                sx={videoSx.volumeRoot}
            >
                {volume === 0 ? (
                    <VolumeOffIcon sx={videoSx.volumeIcon} />
                ) : (
                    <VolumeUpIcon sx={videoSx.volumeIcon} />
                )}
                <Box
                    sx={videoSx.volumePopover(hoveredVolume)}
                    onClick={handlePopoverClick}
                >
                    <Slider
                        aria-label="Громкость"
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={handleVolume}
                        orientation={isMobile ? "vertical" : "horizontal"}
                        size="small"
                        sx={videoSx.volumeSlider}
                    />
                </Box>
            </Box>
        </>
    )
}

