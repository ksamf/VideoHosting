import Button from "@mui/material/Button";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { useRef, type DragEvent } from "react";

type SelectVideoProps = {
    onSelect: (file: File) => void;
};

export default function SelectVideo({ onSelect }: SelectVideoProps) {
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onSelect(file);
    };
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const openFileDialog = () => {
        inputRef.current?.click();
    };
    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onSelect(file);
                    e.currentTarget.value = "";
                }}
            />
            <Paper
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={openFileDialog}
                sx={(theme) => ({
                    padding: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: 200,
                    boxShadow: "none",
                    color: theme.palette.text.primary,
                })}>

                <IconButton
                    sx={(theme) => ({
                        display: 'block',
                        m: "100px auto",
                        border: `2px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.default,
                    })}>
                    <FileUploadIcon sx={(theme) => ({ color: theme.palette.text.secondary, fontSize: 150 })} />
                </IconButton  >
                <Typography variant="body1" align="center" sx={{ marginTop: '50px', color: "text.secondary" }}>
                    Перетащите файлы сюда или нажмите кнопку ниже, чтобы выбрать их на компьютере.
                </Typography>
            </Paper>

            <Button
                onClick={openFileDialog}
                variant="contained"
                sx={{ display: 'block', m: "auto" }}
            >
                <Typography variant="body1" sx={(theme) => ({ color: theme.palette.background.default })}>Выберите файл</Typography>
            </Button>
        </>
    )
}
