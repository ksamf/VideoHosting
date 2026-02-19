import { useEffect, useState } from "react";
import { getMe } from "../api/auth";

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
