import SetVideoDetails from "../forms/SetVideoDetails";
import SelectVideo from "../forms/SelectVideo";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { getVideoPreview } from "../../utils/GetVideoPreview"
import { formSx } from "../../styles/sx/form";

export default function UploadVideo() {
    const navigate = useNavigate();
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
            <Box sx={formSx.uploadModal}>
                <Box sx={formSx.uploadHeader}>
                    <Typography variant="h6">{step === 1 ? "Загрузка видео" : "Детали видео"} </Typography>
                    <IconButton onClick={() => navigate("/studio")} sx={formSx.uploadCloseButton}>
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
                        onPublished={() => navigate("/studio")}
                    />
                )}
            </Box>
        </Modal>
    );
}


