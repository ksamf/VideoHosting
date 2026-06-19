import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import useLocalStorage from "./useLocalStorage";
import useKeyboardShortcuts from "./useKeyboardShortcuts";
import { updateVideoViews } from "../api/videos";
import { getDeviceId } from "../utils/GetDeviceId";
import { getPlayedSeconds } from "../utils/GetPlayedSeconds";


const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const HIDE_CONTROLS_TIMEOUT = 2500;
const BUFFERING_DELAY = 200;
const UPDATE_THROTTLE_MS = 250;
const SAVE_PROGRESS_INTERVAL = 3000;
const VIEW_THRESHOLD_SECONDS = 30;

type PlayerState = {
    playing: boolean;
    progress: number;
    duration: number;
    currentTime: number;
    buffering: boolean;
};

type ShortcutHandler = (event: KeyboardEvent) => void;

type WebKitVideoElement = HTMLVideoElement & {
    webkitDisplayingFullscreen?: boolean;
    webkitEnterFullscreen?: () => void;
    webkitExitFullscreen?: () => void;
};

export default function useVideoPlayer(videoId: string) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bufferingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastUpdateRef = useRef(0);
    const lastVolumeRef = useRef(1);
    const viewSentRef = useRef(false);

    const [selectedIndex, setSelectedIndex] = useLocalStorage(`video-quality-${videoId}`, 0);
    const [playbackRate, setPlaybackRate] = useLocalStorage("video-playback-rate", 1);
    const [volume, setVolume] = useLocalStorage("video-volume", 1);

    const [player, setPlayer] = useState<PlayerState>({
        playing: false,
        progress: 0,
        duration: 0,
        currentTime: 0,
        buffering: false,
    });

    const [controlsVisible, setControlsVisible] = useState(true);
    const [hoveredVolume, setHoveredVolume] = useState(false);

    const { duration, currentTime, buffering } = player;
    const effectiveControlsVisible = controlsVisible || buffering;

    const updatePlayer = useCallback((patch: Partial<PlayerState>) => {
        setPlayer((prev) => ({ ...prev, ...patch }));
    }, []);
    const tryCountView = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !isFinite(video.duration) || viewSentRef.current) return;

        const threshold = Math.min(VIEW_THRESHOLD_SECONDS, video.duration);
        const playedSeconds = Math.floor(getPlayedSeconds(video));
        const reached =
            video.duration < VIEW_THRESHOLD_SECONDS
                ? video.ended || playedSeconds >= Math.max(0, Math.floor(video.duration - 0.5))
                : playedSeconds >= threshold;

        if (!reached) return;

        viewSentRef.current = true;
        try {
            await updateVideoViews(videoId, getDeviceId(), playedSeconds);
        } catch (e) {
            console.log(e);
            viewSentRef.current = false;
        }
    }, [videoId]);
    useEffect(() => {
        if (!videoId) return;

        const interval = setInterval(() => {
            if (videoRef.current) {
                localStorage.setItem(`video-progress-${videoId}`, String(videoRef.current.currentTime));
            }
        }, SAVE_PROGRESS_INTERVAL);

        return () => clearInterval(interval);
    }, [videoId]);

    useEffect(() => {
        if (!videoId || !videoRef.current) return;
        const saved = localStorage.getItem(`video-progress-${videoId}`);
        if (saved) {
            const parsed = Number(saved);
            if (!Number.isNaN(parsed)) {
                videoRef.current.currentTime = parsed;
            }
        }
    }, [videoId]);

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            if (bufferingTimer.current) clearTimeout(bufferingTimer.current);
        };
    }, []);

    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    const showControls = useCallback(() => {
        setControlsVisible(true);
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setControlsVisible(false);
            }
        }, HIDE_CONTROLS_TIMEOUT);
    }, []);

    const hideControls = useCallback(() => {
        if (videoRef.current && !videoRef.current.paused && !buffering) {
            setControlsVisible(false);
        }
    }, [buffering]);

    const togglePlay = useCallback(() => {
        if (buffering) return;

        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => console.error("Play failed"));
            updatePlayer({ playing: true });
            showControls();
        } else {
            video.pause();
            updatePlayer({ playing: false });
            setControlsVisible(true);
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        }
    }, [buffering, updatePlayer, showControls]);

    const handleVideoClick = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            void video.play()
                .then(() => {
                    updatePlayer({ playing: true });
                    showControls();
                })
                .catch((err) => console.error("Play failed", err));
            return;
        }

        video.pause();
        updatePlayer({ playing: false });
        setControlsVisible(true);
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }
    }, [updatePlayer, showControls]);

    const changeSpeed = useCallback(
        (direction: number) => {
            const idx = SPEEDS.indexOf(playbackRate);
            const next = SPEEDS[idx + direction];
            if (next == null) return;

            if (videoRef.current) {
                videoRef.current.playbackRate = next;
            }
            setPlaybackRate(next);
        },
        [playbackRate, setPlaybackRate]
    );

    const changeVolume = useCallback(
        (delta: number) => {
            setVolume((v) => Math.max(0, Math.min(1, v + delta)));
        },
        [setVolume]
    );

    const seek = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
        }
    }, [duration]);

    const toggleMute = useCallback(() => {
        if (videoRef.current && videoRef.current.volume > 0) {
            lastVolumeRef.current = videoRef.current.volume;
            setVolume(0);
        } else {
            setVolume(lastVolumeRef.current || 1);
        }
    }, [setVolume]);

    const handleFullscreen = useCallback(async () => {
        const container = containerRef.current;
        const video = videoRef.current;
        if (!container || !video) return;

        const fullscreenElement = document.fullscreenElement;
        const isCurrentFullscreen = fullscreenElement === container;
        const webKitVideo = video as WebKitVideoElement;

        try {
            if (isCurrentFullscreen) {
                await document.exitFullscreen?.();
                return;
            }

            if (container.requestFullscreen) {
                await container.requestFullscreen();
                return;
            }

            if (video.requestFullscreen) {
                await video.requestFullscreen();
                return;
            }

            if (webKitVideo.webkitDisplayingFullscreen) {
                webKitVideo.webkitExitFullscreen?.();
                return;
            }

            webKitVideo.webkitEnterFullscreen?.();
        } catch (err) {
            console.error("Fullscreen toggle failed", err);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video || !duration) return;

        const now = performance.now();
        if (now - lastUpdateRef.current < UPDATE_THROTTLE_MS) return;
        lastUpdateRef.current = now;

        const time = video.currentTime;
        updatePlayer({
            currentTime: time,
            progress: (time / duration) * 100,
        });
        tryCountView();
    }, [duration, updatePlayer, tryCountView]);

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current;
        if (!video || !isFinite(video.duration)) return;

        updatePlayer({ duration: video.duration });

        const saved = localStorage.getItem(`video-progress-${videoId}`);
        if (saved) {
            const parsed = Number(saved);
            if (!Number.isNaN(parsed)) {
                const restore = Math.min(parsed, video.duration - 0.2);
                if (restore > 0) {
                    video.currentTime = restore;
                    updatePlayer({
                        currentTime: restore,
                        progress: (restore / video.duration) * 100,
                    });
                }
            }
        }

        video.playbackRate = playbackRate;
    }, [videoId, playbackRate, updatePlayer]);

    const startBuffering = useCallback(() => {
        if (bufferingTimer.current) {
            clearTimeout(bufferingTimer.current);
        }
        bufferingTimer.current = setTimeout(() => {
            updatePlayer({ buffering: true });
        }, BUFFERING_DELAY);
    }, [updatePlayer]);

    const stopBuffering = useCallback(() => {
        if (bufferingTimer.current) {
            clearTimeout(bufferingTimer.current);
        }
        updatePlayer({ buffering: false });
    }, [updatePlayer]);

    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const shortcuts = useMemo<Record<string, ShortcutHandler>>(
        () => ({
            " ": (e: KeyboardEvent) => {
                e.preventDefault();
                togglePlay();
            },
            "ArrowRight": () => seek(currentTime + 10),
            "ArrowLeft": () => seek(currentTime - 10),
            "ArrowUp": () => changeVolume(0.1),
            "ArrowDown": () => changeVolume(-0.1),
            m: () => toggleMute(),
            M: () => toggleMute(),
            f: () => handleFullscreen(),
            F: () => handleFullscreen(),
            ">": () => changeSpeed(1),
            "<": () => changeSpeed(-1),
        }),
        [togglePlay, seek, currentTime, changeVolume, toggleMute, handleFullscreen, changeSpeed]
    );

    useKeyboardShortcuts(shortcuts, containerRef);

    return {
        videoRef,
        containerRef,
        selectedIndex,
        setSelectedIndex,
        playbackRate,
        setPlaybackRate,
        changeSpeed,
        volume,
        setVolume,
        changeVolume,
        toggleMute,
        player,
        updatePlayer,
        controlsVisible,
        setControlsVisible,
        effectiveControlsVisible,
        hoveredVolume,
        setHoveredVolume,
        showControls,
        hideControls,
        togglePlay,
        handleVideoClick,
        seek,
        handleFullscreen,
        handleTimeUpdate,
        handleLoadedMetadata,
        startBuffering,
        stopBuffering,
        formatTime,
        tryCountView,
    };
}
