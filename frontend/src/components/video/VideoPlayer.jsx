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


export default function VideoPlayer({ src, poster, qualities = [], videoId }) {
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
        controlsVisible,
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
    const safeQualities = useMemo(() => (Array.isArray(qualities) ? qualities : []), [qualities]);

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
            sx={{
                width: "100%",
                maxWidth: 1200,
                backgroundColor: "#000",
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                cursor: effectiveControlsVisible ? "default" : "none",
            }}
        >
            {videoSrc ? (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={poster}
                    style={{
                        width: "100%",
                        display: "block",
                        position: "relative",
                    }}
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
                <Box sx={(theme) => ({ color: theme.palette.text.secondary, p: 3, textAlign: "center" })}>
                    Видео недоступно
                </Box>
            )}

            {effectiveControlsVisible && (
                <Box
                    sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        px: 1.5,
                        py: 1,
                        background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
                        zIndex: 2,
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        opacity: effectiveControlsVisible ? 1 : 0,
                        transform: effectiveControlsVisible ? "translateY(0)" : "translateY(100%)",
                        pointerEvents: effectiveControlsVisible ? "auto" : "none",
                    }}
                >
                    <VideoSlider
                        videoRef={videoRef}
                        videoSrc={videoSrc}
                        progress={progress}
                        controlsVisible={controlsVisible}
                        duration={duration}
                        buffering={player.buffering}
                        setProgress={(p) => updatePlayer({ progress: p })}
                        setCurrentTime={(t) => updatePlayer({ currentTime: t })}
                        formatTime={formatTime}
                    />

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
                        <IconButton onClick={togglePlay} sx={(theme) => ({ color: theme.palette.text.primary })}>
                            {playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>

                        <SelectVolume
                            volume={volume}
                            setVolume={setVolume}
                            videoRef={videoRef}
                            hoveredVolume={hoveredVolume}
                            setHoveredVolume={setHoveredVolume}
                        />

                        <Box
                            sx={{
                                width: hoveredVolume ? 110 : 0,
                                transition: "width 0.2s ease",
                                flexShrink: 0,
                            }}
                        />

                        <Typography sx={(theme) => ({ color: theme.palette.text.primary, fontSize: 12 })}>
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

                        <IconButton onClick={handleFullscreen} sx={(theme) => ({ color: theme.palette.text.primary })}>
                            <FullscreenIcon />
                        </IconButton>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
