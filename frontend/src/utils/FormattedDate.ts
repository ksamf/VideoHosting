export function formattedDate(date: Date | string | number | null | undefined): string {
    const uploadDate = date ? new Date(date) : null;
    if (!uploadDate || Number.isNaN(uploadDate.getTime())) {
        return "";
    }

    const formattedDate = uploadDate
        .toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    return formattedDate
}
