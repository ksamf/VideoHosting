import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Paper,
} from "@mui/material";
import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { uploadVideo } from "../../api/videos";
import { useNavigate } from "react-router-dom";

type SetVideoDetailsProps = {
    file: File;
    defaultPreview: File | null;
    defaultPreviewUrl: string;
};

export default function VideoDetailsStep({ file, defaultPreview, defaultPreviewUrl }: SetVideoDetailsProps) {
    const navigate = useNavigate();

    const videoUrl = useMemo(() => {
        return file ? URL.createObjectURL(file) : null;
    }, [file]);

    const [name, setName] = useState(() =>
        file ? file.name.replace(/\.[^/.]+$/, "") : ""
    );

    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([""]);
    const [preview, setPreview] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("16 / 9");
    const [videoPreview, setVideoPreview] = useState<string>(defaultPreviewUrl);
    const [uploading, setUploading] = useState(false);


    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [videoUrl, previewUrl]);

    const handleTagChange = (value: string, index: number) => {
        const updated = [...tags];
        updated[index] = value;

        if (value && index === tags.length - 1) {
            updated.push("");
        }

        setTags(updated);
    };
    const handleCustomPreview = (file?: File) => {
        if (!file) return;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        const nextPreviewUrl = URL.createObjectURL(file);
        setPreview(file);
        setPreviewUrl(nextPreviewUrl);
        setVideoPreview(nextPreviewUrl);
    };


    const isInvalid =
        name.length < 1 ||
        name.length > 100 ||
        description.length > 5000;

    const handleUpload = async () => {
        if (uploading) return;

        const formData = new FormData();

        formData.append("video", file);
        formData.append("name", name);
        formData.append("description", description);
        if (defaultPreview) {
            formData.append("default_preview", defaultPreview);
        }
        if (preview) formData.append("preview", preview);

        tags.filter(Boolean).forEach(tag =>
            formData.append("tags[]", tag)
        );

        try {
            setUploading(true);
            await uploadVideo(formData);
            navigate("/studio");
        } catch (error) {
            console.error(error);
            alert("Не удалось загрузить видео");
        } finally {
            setUploading(false);
        }
    };

    const handleLoadedMetadata = (e: ChangeEvent<HTMLVideoElement>) => {
        const v = e.currentTarget;
        setAspectRatio(`${v.videoWidth} / ${v.videoHeight}`);
    };

    return (
        <>
            <Stack direction="row" spacing={3}>
                <Box sx={{ flex: 2 }}>
                    <TextField
                        label="Название (обязательное поле)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 100 }}
                        helperText={`${name.length}/100`}
                        error={name.length < 1 || name.length > 100}
                        sx={{
                            mb: 2,
                            "& .MuiFormHelperText-root": {
                                color:
                                    name.length < 1 || name.length > 100
                                        ? "#f44336"
                                        : "#aaa",
                            },
                        }}
                    />

                    <TextField
                        label="Описание"
                        multiline
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 5000 }}
                        helperText={`${description.length}/5000`}
                        error={description.length > 5000}
                        sx={{
                            mb: 3,
                            "& .MuiFormHelperText-root": {
                                color:
                                    description.length > 5000 ? "#f44336" : "#aaa",
                            },
                        }}
                    />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Превью
                    </Typography>
                    <Stack
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                        }}>
                        <Paper
                            component="label"
                            sx={{
                                width: 240,
                                aspectRatio,
                                bgcolor: "#1f1f1f",
                                border: "1px dashed #555",
                                borderRadius: 2,
                                cursor: "pointer",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "10px"
                            }}
                        >
                            {preview ? (
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <Typography color="#aaa">Загрузить</Typography>
                            )}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    handleCustomPreview(e.target.files?.[0]);
                                    e.currentTarget.value = "";
                                }}
                            />

                        </Paper>
                        <Paper
                            component="label"
                            sx={{
                                width: 240,
                                aspectRatio,
                                bgcolor: "#1f1f1f",
                                border: "1px dashed #555",
                                borderRadius: 2,
                                cursor: "pointer",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onClick={() => setVideoPreview(defaultPreviewUrl)}

                        >
                            <img
                                src={defaultPreviewUrl}
                                alt="preview"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Paper>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                        Теги
                    </Typography>

                    {tags.map((tag, i) => (
                        <TextField
                            key={i}
                            value={tag}
                            onChange={(e) => handleTagChange(e.target.value, i)}
                            fullWidth
                            inputProps={{ maxLength: 50 }}
                            helperText={`${tag.length}/50`}
                            error={tag.length > 50}
                            sx={{
                                mb: 1,
                                "& .MuiFormHelperText-root": {
                                    color:
                                        tag.length > 50
                                            ? "#f44336"
                                            : "#aaa",
                                },
                            }}
                        />
                    ))}
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Предпросмотр
                    </Typography>

                    <Paper
                        sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "#000",
                            position: "relative",
                            aspectRatio,
                            width: "100%"
                        }}
                    >
                        <video
                            src={videoUrl}
                            onLoadedMetadata={handleLoadedMetadata}
                            poster={videoPreview ?? undefined}
                            controls
                            width="100%"
                            height="100%"
                            style={{ display: "block" }}
                        />
                    </Paper>
                </Box>
            </Stack >

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={isInvalid || uploading}
                    sx={{
                        borderRadius: "50px",
                        textTransform: "none",
                        backgroundColor: "#fff",
                        color: "#555",
                        "&:hover": { backgroundColor: "#909090" },
                        "&.Mui-disabled": {
                            color: "#fff !important",
                            opacity: 0.6,
                        },
                    }}
                >
                    {uploading ? "Публикация..." : "Опубликовать"}
                </Button>
            </Stack>
        </>
    );
}
