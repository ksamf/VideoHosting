import { useEffect, useRef, useState, type MouseEvent, type Dispatch, type SetStateAction, type RefObject } from "react";
import { Box, Menu, MenuItem } from "@mui/material";
import { videoSx } from "../../styles/sx/video";

type SelectQualityProps = {
    qualities: number[];
    videoRef: RefObject<HTMLVideoElement | null>;
    setPlaying: (playing: boolean) => void;
    selectedIndex: number;
    setSelectedIndex: Dispatch<SetStateAction<number>>;
}
export default function SelectQuality({ qualities, videoRef, setPlaying, selectedIndex, setSelectedIndex }: SelectQualityProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const restoreTimeRef = useRef<number>(0);
    const resumePlaybackRef = useRef<boolean>(false);
    const pendingSwitchRef = useRef<boolean>(false);
    const open = Boolean(anchorEl);

    const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (_: MouseEvent<HTMLElement>, index: number) => {
        if (index === selectedIndex) {
            setAnchorEl(null);
            return;
        }

        const video = videoRef.current;

        if (video && Number.isFinite(video.currentTime)) {
            restoreTimeRef.current = video.currentTime;
            resumePlaybackRef.current = !video.paused;
            pendingSwitchRef.current = true;
            video.pause();
            setPlaying(false);
        }

        setSelectedIndex(index);
        setAnchorEl(null);
    };

    useEffect(() => {
        if (!pendingSwitchRef.current) return;

        const video = videoRef.current;
        if (!video) return;

        const restorePlayback = () => {
            const safeTime = Math.max(0, restoreTimeRef.current);
            if (Number.isFinite(safeTime)) {
                video.currentTime = safeTime;
            }

            if (resumePlaybackRef.current) {
                video
                    .play()
                    .then(() => setPlaying(true))
                    .catch(() => {
                        setPlaying(false);
                    });
            }

            pendingSwitchRef.current = false;
        };

        video.addEventListener("loadedmetadata", restorePlayback, { once: true });

        return () => {
            video.removeEventListener("loadedmetadata", restorePlayback);
        };
    }, [selectedIndex, setPlaying, videoRef]);

    return (
        <>
            {qualities.length > 0 && (
                <>
                    <Box
                        onClick={handleClickListItem}
                        sx={videoSx.selectButton}
                    >
                        {qualities[selectedIndex]}p
                    </Box>

                    <Menu
                        id="quality-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "center",
                        }}
                        transformOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                        }}
                        slotProps={{
                            paper: {
                                sx: videoSx.selectMenuPaper,
                            },
                        }}
                    >
                        {qualities.map((option, index) => (
                            <MenuItem
                                key={option}
                                selected={index === selectedIndex}
                                onClick={(event) => handleMenuItemClick(event, index)}
                                sx={videoSx.selectMenuItem}
                            >
                                {option}p
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            )}
        </>
    );
}

