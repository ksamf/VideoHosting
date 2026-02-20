import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useFormAuth<TForm extends Record<string, unknown>>(
    authFn: (formData: TForm) => Promise<unknown> | unknown
) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: TForm) => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const result = await authFn(formData);
            if (result) {
                navigate("/");
            }
        } catch (err: unknown) {
            console.error("Auth error:", err);
            setError(err instanceof Error ? err.message : "Ошибка аутентификации");
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
