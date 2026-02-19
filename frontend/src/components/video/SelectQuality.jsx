import { useEffect, useRef, useState } from "react";
import { Box, Menu, MenuItem } from "@mui/material";

export default function SelectQuality({ qualities, videoRef, setPlaying, selectedIndex, setSelectedIndex }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const restoreTimeRef = useRef(0);
    const resumePlaybackRef = useRef(false);
    const pendingSwitchRef = useRef(false);
    const open = Boolean(anchorEl);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (_, index) => {
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
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "20px",
                            border: "1px solid #555",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            minWidth: 48,
                            textAlign: "center",
                            "&:hover": {
                                bgcolor: "#222",
                            },
                        }}
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
                                sx: {
                                    bgcolor: "#1f1f1f",
                                    color: "#fff",
                                    borderRadius: 2,
                                    minWidth: 80,
                                },
                            },
                        }}
                    >
                        {qualities.map((option, index) => (
                            <MenuItem
                                key={option}
                                selected={index === selectedIndex}
                                onClick={(event) => handleMenuItemClick(event, index)}
                                sx={{
                                    justifyContent: "center",
                                    "&.Mui-selected": {
                                        bgcolor: "#333",
                                    },
                                    "&:hover": {
                                        bgcolor: "#444",
                                    },
                                }}
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
