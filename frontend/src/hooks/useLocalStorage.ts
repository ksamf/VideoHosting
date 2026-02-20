import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

export default function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? (JSON.parse(saved) as T) : defaultValue;
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
