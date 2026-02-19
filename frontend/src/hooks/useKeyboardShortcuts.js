import { useEffect } from "react";

export default function useKeyboardShortcuts(shortcuts, containerRef = null) {
    useEffect(() => {
        const handleKey = (e) => {
            if (containerRef?.current && !containerRef.current.contains(document.activeElement)) {
                return;
            }

            if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
                return;
            }

            const handler = shortcuts[e.key];
            if (handler) {
                handler(e);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [shortcuts, containerRef]);
}