import { useState, type Dispatch, type MouseEvent, type RefObject, type SetStateAction } from "react";
import { Box, Menu, MenuItem } from "@mui/material";

type SelectSpeedProps = {
    playbackRate: number;
    setPlaybackRate: Dispatch<SetStateAction<number>>;
    videoRef: RefObject<HTMLVideoElement | null>;
}

export default function SelectSpeed({ playbackRate, setPlaybackRate, videoRef }: SelectSpeedProps) {
    const [speedAnchorEl, setSpeedAnchorEl] = useState<HTMLElement | null>(null);
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    const speedOpen = Boolean(speedAnchorEl);

    return (
        <>
            <Box
                onClick={(e: MouseEvent<HTMLElement>) => setSpeedAnchorEl(e.currentTarget)}
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
                {playbackRate}x
            </Box>

            <Menu
                anchorEl={speedAnchorEl}
                open={speedOpen}
                onClose={() => setSpeedAnchorEl(null)}
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
                {speeds.map((s) => (
                    <MenuItem
                        key={s}
                        selected={s === playbackRate}
                        onClick={() => {
                            setPlaybackRate(s);
                            if (videoRef.current) {
                                videoRef.current.playbackRate = s;
                            }
                            setSpeedAnchorEl(null);
                        }}
                        sx={{
                            justifyContent: "center",
                            "&.Mui-selected": { bgcolor: "#333" },
                            "&:hover": { bgcolor: "#444" },
                        }}
                    >
                        {s}x
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
