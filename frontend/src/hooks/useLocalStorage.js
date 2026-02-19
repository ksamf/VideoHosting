import { useState, useEffect } from "react";

export default function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (err) {
            console.error(`useLocalStorage: Failed to parse ${key}`, err);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error(`useLocalStorage: Failed to save ${key}`, err);
        }
    }, [key, value]);

    return [value, setValue];
}