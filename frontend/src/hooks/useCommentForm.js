import { useState } from "react";
import { addComment } from "../api/videos";

export default function useCommentForm(videoId, onCommentAdded) {
    const [commentText, setCommentText] = useState("");
    const [sendingComment, setSendingComment] = useState(false);
    const [error, setError] = useState(null);

    const isDisabledSend = commentText.trim().length === 0;

    const handleSubmitComment = async () => {
        if (!commentText.trim() || sendingComment) return;

        setSendingComment(true);
        setError(null);

        try {
            const newComment = await addComment(videoId, commentText);
            onCommentAdded?.(newComment, commentText);

            setCommentText("");
        } catch (err) {
            console.error("Ошибка отправки комментария", err);
            setError(err.message || "Не удалось отправить комментарий");
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