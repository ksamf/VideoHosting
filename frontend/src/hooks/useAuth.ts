import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import type { User } from "../types/user";

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isActive = true;
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
        return () => {
            isActive = false;
        };
    }, []);
    return { user, loading, isAuth: !!user };
}
