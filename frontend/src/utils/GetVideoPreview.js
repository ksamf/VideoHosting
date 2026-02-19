export function getVideoPreview(videoFile) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(videoFile);
        video.src = url;

        video.onloadedmetadata = () => {
            video.currentTime = video.duration / 2;
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (!blob) return reject("Не удалось получить кадр");

                resolve({
                    file: new File([blob], "preview.jpg", { type: "image/jpeg" }),
                    url: URL.createObjectURL(blob),
                });
            }, "image/jpeg", 0.9);
        };

        video.onerror = reject;
    });
}
