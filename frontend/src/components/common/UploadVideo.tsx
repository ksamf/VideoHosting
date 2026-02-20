import SetVideoDetails from "../forms/SetVideoDetails";
import SelectVideo from "../forms/SelectVideo";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Typography, useTheme } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { getVideoPreview } from "../../utils/GetVideoPreview"

export default function UploadVideo() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [step, setStep] = useState<number>(1);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith("video/")) {
            alert("Можно загружать только видео");
            return;
        }
        try {
            setFile(file);
            const thumbBlob = await getVideoPreview(file);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreview(thumbBlob.file);
            setPreviewUrl(thumbBlob.url);
            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Не удалось создать превью для видео");
        }
    };

    return (
        <Modal open onClose={() => navigate("/studio")}>
            <Box sx={{
                overflow: "auto",
                color: theme.palette.text.secondary,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: "90%", md: 900 },
                height: { xs: "70vh", md: "80vh" },
                bgcolor: '#282828',
                p: 2,
                borderRadius: 2
            }}>
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

                {step === 2 && file && preview && previewUrl && (
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
