import { useState, type Dispatch, type MouseEvent, type RefObject, type SetStateAction } from "react";
import { Box, Menu, MenuItem } from "@mui/material";
import { videoSx } from "../../styles/theme";

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
                sx={videoSx.selectButton}
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
                        sx: videoSx.selectMenuPaper,
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
                        sx={videoSx.selectMenuItem}
                    >
                        {s}x
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
