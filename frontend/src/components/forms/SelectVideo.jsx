import Button from "@mui/material/Button"
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Input from "@mui/material/Input";
import { useRef } from 'react'


export default function SelectVideo({ onSelect }) {
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onSelect(file);
    };
    const inputRef = useRef(null);
    const handleDragOver = (e) => {
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
                }}
            />
            <Paper
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={openFileDialog}
                sx={{
                    padding: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: 200,
                    boxShadow: "none",
                }}>

                <IconButton
                    variant="contained"
                    sx={{
                        display: 'block',
                        m: "100px auto",
                        border: '2px solid #555',
                        bgcolor: '#1a1a1a',
                    }}>
                    <FileUploadIcon sx={{ color: '#aaa', fontSize: 150 }} />
                </IconButton  >
                <Typography variant="body1" align="center" sx={{ marginTop: '50px', color: "#aaa" }}>
                    Перетащите файлы сюда или нажмите кнопку ниже, чтобы выбрать их на компьютере.
                </Typography>
            </Paper>

            <Button
                onClick={openFileDialog}
                variant="contained"
                sx={{ display: 'block', m: "auto" }}
            >
                <Typography variant="body1" sx={{ color: "#1a1a1a" }}>Выберите файл</Typography>
            </Button>
        </>
    )
}