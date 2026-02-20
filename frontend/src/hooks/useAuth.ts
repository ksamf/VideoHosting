import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import type { User } from "../types/user";
import { AUTH_CHANGED_EVENT } from "../utils/authEvents";

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isActive = true;

        const refreshAuth = () => {
            setLoading(true);
            getMe()
                .then((data) => {
                    if (isActive) setUser(data);
                })
                .catch(() => {
                    if (isActive) setUser(null);
                })
                .finally(() => {
                    if (isActive) setLoading(false);
                });
        };

        refreshAuth();
        window.addEventListener(AUTH_CHANGED_EVENT, refreshAuth);

        return () => {
            isActive = false;
            window.removeEventListener(AUTH_CHANGED_EVENT, refreshAuth);
        };
    }, []);
    return { user, loading, isAuth: !!user };
}
