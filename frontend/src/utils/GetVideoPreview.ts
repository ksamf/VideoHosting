export function getVideoPreview(videoFile: File): Promise<{ file: File; url: string }> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(videoFile);
        let cleaned = false;

        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            URL.revokeObjectURL(url);
            video.removeAttribute("src");
            video.load();
        };
        video.src = url;

        video.onloadedmetadata = () => {
            video.currentTime = video.duration / 2;
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                cleanup();
                reject(new Error("Не удалось получить контекст canvas"));
                return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    cleanup();
                    reject(new Error("Не удалось получить кадр"));
                    return;
                }

                resolve({
                    file: new File([blob], "preview.jpg", { type: "image/jpeg" }),
                    url: URL.createObjectURL(blob),
                });
                cleanup();
            }, "image/jpeg", 0.9);
        };

        video.onerror = () => {
            cleanup();
            reject(new Error("Ошибка обработки видео для превью"));
        };
    });
}
