export  function formattedDate(date){
    const uploadDate = date ? new Date(date) : null;

    const formattedDate = uploadDate
        ? uploadDate.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";
    return formattedDate
}