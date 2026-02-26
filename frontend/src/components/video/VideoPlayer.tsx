import { Box, IconButton, Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import SelectQuality from "./SelectQuality";
import SelectSpeed from "./SelectSpeed";
import SelectVolume from "./SelectVolume";
import VideoSlider from "./VideoSlider";
import useVideoPlayer from "../../hooks/useVideoPlayer";
import { useEffect, useMemo } from "react";
import { videoSx } from "../../styles/sx/video";

type VideoPlayerProps = {
    src: string;
    poster?: string;
    qualities?: number[];
    videoId: string;
};

export default function VideoPlayer({ src, poster, qualities = [], videoId }: VideoPlayerProps) {
    const {
        videoRef,
        containerRef,
        selectedIndex,
        setSelectedIndex,
        playbackRate,
        setPlaybackRate,
        volume,
        setVolume,
        player,
        updatePlayer,
        effectiveControlsVisible,
        hoveredVolume,
        setHoveredVolume,
        showControls,
        hideControls,
        togglePlay,
        handleFullscreen,
        handleTimeUpdate,
        handleLoadedMetadata,
        startBuffering,
        stopBuffering,
        formatTime,
        tryCountView
    } = useVideoPlayer(videoId);


    const { playing, progress, duration, currentTime } = player;
    const safeQualities = useMemo<number[]>(() => (Array.isArray(qualities) ? qualities : []), [qualities]);

    useEffect(() => {
        if (safeQualities.length === 0) return;
        if (selectedIndex < 0 || selectedIndex >= safeQualities.length) {
            setSelectedIndex(0);
        }
    }, [safeQualities, selectedIndex, setSelectedIndex]);

    const safeIndex = selectedIndex >= 0 && selectedIndex < safeQualities.length ? selectedIndex : 0;

    const videoSrc = src && safeQualities.length > 0 && safeQualities[safeIndex]
        ? `${String(src).replace(/\/+$/, "")}/${safeQualities[safeIndex]}.mp4`
        : null;

    return (
        <Box
            ref={containerRef}
            onMouseMove={showControls}
            onMouseEnter={showControls}
            onMouseLeave={hideControls}
            sx={videoSx.playerContainer(effectiveControlsVisible)}
        >
            {videoSrc ? (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={poster}
                    style={{ width: "100%", display: "block", position: "relative" }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                    onWaiting={startBuffering}
                    onPlaying={stopBuffering}
                    onCanPlay={stopBuffering}
                    onEnded={tryCountView}
                    playsInline
                />
            ) : (
                <Box sx={videoSx.playerUnavailable}>
                    Видео недоступно
                </Box>
            )}

            {effectiveControlsVisible && (
                <Box
                    sx={videoSx.playerControls(effectiveControlsVisible)}
                >
                    <VideoSlider
                        videoRef={videoRef}
                        progress={progress}
                        duration={duration}
                        buffering={player.buffering}
                        setProgress={(p) => updatePlayer({ progress: p })}
                        setCurrentTime={(t) => updatePlayer({ currentTime: t })}
                        formatTime={formatTime}
                    />

                    <Stack direction="row" alignItems="center" spacing={1} sx={videoSx.playerControlsRow}>
                        <IconButton onClick={togglePlay} sx={videoSx.playerActionIcon}>
                            {playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>

                        <SelectVolume
                            volume={volume}
                            setVolume={setVolume}
                            videoRef={videoRef}
                            hoveredVolume={hoveredVolume}
                            setHoveredVolume={setHoveredVolume}
                        />

                        <Box sx={videoSx.playerHoveredVolumeSpacer(hoveredVolume)} />

                        <Typography sx={videoSx.playerTime}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />

                        <SelectSpeed
                            playbackRate={playbackRate}
                            setPlaybackRate={setPlaybackRate}
                            videoRef={videoRef}
                        />

                        <SelectQuality
                            qualities={safeQualities}
                            videoRef={videoRef}
                            selectedIndex={safeIndex}
                            setSelectedIndex={setSelectedIndex}
                            setPlaying={(v) => updatePlayer({ playing: v })}
                        />

                        <IconButton onClick={handleFullscreen} sx={videoSx.playerActionIcon}>
                            <FullscreenIcon />
                        </IconButton>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}

