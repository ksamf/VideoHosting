import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Paper
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { uploadVideo } from "../../api/videos";
import { useNavigate } from "react-router-dom";


export default function VideoDetailsStep({ file, defaultPreview, defaultPreviewUrl }) {
    const navigate = useNavigate();

    const videoUrl = useMemo(() => {
        return file ? URL.createObjectURL(file) : null;
    }, [file]);

    const [name, setName] = useState(() =>
        file ? file.name.replace(/\.[^/.]+$/, "") : ""
    );

    const [description, setDescription] = useState("");
    const [tags, setTags] = useState([""]);
    const [preview, setPreview] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [aspectRatio, setAspectRatio] = useState("16 / 9");
    const [videoPreview, setVideoPreview] = useState(defaultPreviewUrl)


    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [videoUrl, previewUrl]);

    const handleTagChange = (value, index) => {
        const updated = [...tags];
        updated[index] = value;

        if (value && index === tags.length - 1) {
            updated.push("");
        }

        setTags(updated);
    };
    const handleCustomPreview = (file) => {
        if (!file) return;
        setPreview(file);
        setPreviewUrl(URL.createObjectURL(file));
        setVideoPreview(URL.createObjectURL(file))
    };


    const isInvalid =
        name.length < 1 ||
        name.length > 100 ||
        description.length > 5000;

    const handleUpload = async () => {
        const formData = new FormData();

        formData.append("video", file);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("default_preview", defaultPreview);
        if (preview) formData.append("preview", preview);

        tags.filter(Boolean).forEach(tag =>
            formData.append("tags[]", tag)
        );

        await uploadVideo(formData);
        navigate("/studio");
    };

    const handleLoadedMetadata = (e) => {
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
                        slotProps={{ maxLength: 100 }}
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
                        slotProps={{ maxLength: 5000 }}
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
                                onChange={(e) =>
                                    handleCustomPreview(e.target.files?.[0])
                                }
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
                            slotProps={{ maxLength: 50 }}
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
                            display="block"
                            height="100%"
                        />
                    </Paper>
                </Box>
            </Stack >

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={isInvalid}
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
                    Опубликовать
                </Button>
            </Stack>
        </>
    );
}
