import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useFormAuth(authFn) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const result = await authFn(formData);
            if (result) {
                navigate("/");
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message || "Ошибка аутентификации");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        setError,
        handleSubmit,
    };
}