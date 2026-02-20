import { useState } from "react";
import { addComment } from "../api/videos";

export default function useCommentForm(
    videoId: string,
    onCommentAdded: (newComment: string, rawText: string) => void
) {
    const [commentText, setCommentText] = useState<string>("");
    const [sendingComment, setSendingComment] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isDisabledSend = commentText.trim().length === 0;

    const handleSubmitComment = async () => {
        if (!commentText.trim() || sendingComment) return;

        setSendingComment(true);
        setError(null);

        try {
            const newComment = await addComment(videoId, commentText);
            onCommentAdded?.(newComment, commentText);

            setCommentText("");
        } catch (err: unknown) {
            console.error("Ошибка отправки комментария", err);
            setError(err instanceof Error ? err.message : "Не удалось отправить комментарий");
        } finally {
            setSendingComment(false);
        }
    };

    return {
        commentText,
        setCommentText,
        sendingComment,
        error,
        isDisabledSend,
        handleSubmitComment,
    };
}
