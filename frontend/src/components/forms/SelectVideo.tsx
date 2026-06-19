import Button from "@mui/material/Button";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { useRef, type DragEvent } from "react";
import { formSx } from "../../styles/sx/form";

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
                sx={formSx.selectVideoDropPaper}>

                <IconButton
                    sx={formSx.selectVideoUploadIconButton}>
                    <FileUploadIcon sx={formSx.selectVideoUploadIcon} />
                </IconButton  >
                <Typography variant="body1" align="center" sx={formSx.selectVideoHint}>
                    Перетащите файлы сюда или нажмите кнопку ниже, чтобы выбрать их на компьютере.
                </Typography>
            </Paper>

            <Button
                onClick={openFileDialog}
                variant="contained"
                sx={formSx.selectVideoActionButton}
            >
                <Typography variant="body1" sx={(theme) => ({ color: theme.palette.background.default })}>Выберите файл</Typography>
            </Button>
        </>
    )
}

