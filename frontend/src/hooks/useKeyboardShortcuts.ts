import { useEffect } from "react";

type ShortcutHandler = (event: KeyboardEvent) => void;
type ShortcutsMap = Record<string, ShortcutHandler>;

export default function useKeyboardShortcuts(
    shortcuts: ShortcutsMap,
    containerRef: React.RefObject<HTMLElement | null> | null = null
) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (containerRef?.current && !containerRef.current.contains(document.activeElement)) {
                return;
            }

            const target = e.target as HTMLElement | null;
            if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) {
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
