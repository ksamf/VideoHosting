import SetVideoDetails from "../forms/SetVideoDetails";
import SelectVideo from "../forms/SelectVideo";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { getVideoPreview } from "../../utils/GetVideoPreview"

export default function UploadVideo() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)



    const handleFileSelect = async (file) => {
        if (!file.type.startsWith("video/")) {
            alert("Можно загружать только видео");
            return;
        }
        setFile(file);
        const thumbBlob = await getVideoPreview(file);
        setPreview(thumbBlob.file);
        setPreviewUrl(thumbBlob.url);
        setStep(2);
    };

    return (
        <Modal open onClose={() => navigate("/studio")}>
            <Box sx={(theme) => ({
                overflow: "auto",
                color: theme.palette.text.secondary,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', md: theme.custom.modal.upload.maxWidth },
                height: { xs: '70vh', md: theme.custom.modal.upload.maxHeight },
                bgcolor: '#282828',
                p: 2,
                borderRadius: 2
            })}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}>
                    <Typography variant="h6">{step === 1 ? "Загрузка видео" : "Детали видео"} </Typography>
                    <IconButton onClick={() => navigate("/studio")} sx={{ color: "#aaa" }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {step === 1 && (
                    <SelectVideo onSelect={handleFileSelect} />
                )}

                {step === 2 && (
                    <SetVideoDetails
                        file={file}
                        defaultPreview={preview}
                        defaultPreviewUrl={previewUrl}
                    />
                )}
            </Box>
        </Modal>
    );
}
