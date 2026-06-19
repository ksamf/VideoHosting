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
import { formSx } from "../../styles/sx/form";

type SetVideoDetailsProps = {
    file: File;
    defaultPreview: File | null;
    defaultPreviewUrl: string;
    onPublished: () => void;
};

export default function VideoDetailsStep({ file, defaultPreview, defaultPreviewUrl, onPublished }: SetVideoDetailsProps) {
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
            onPublished();
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }}>
                <Box sx={formSx.setDetailsLeft}>
                    <TextField
                        label="Название (обязательное поле)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 100 }}
                        helperText={`${name.length}/100`}
                        error={name.length < 1 || name.length > 100}
                        sx={formSx.setDetailsHelper(name.length < 1 || name.length > 100)}
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
                        sx={formSx.setDetailsDescription(description.length > 5000)}
                    />

                    <Typography variant="subtitle2" sx={formSx.setDetailsSectionTitle}>
                        Превью
                    </Typography>
                    <Stack sx={formSx.setDetailsPreviewRow}>
                        <Paper
                            component="label"
                            sx={formSx.setDetailsPreviewCard(aspectRatio, true)}
                        >
                            {preview ? (
                                <Box
                                    component="img"
                                    src={previewUrl}
                                    alt="preview"
                                    sx={formSx.setDetailsPreviewContain}
                                />
                            ) : (
                                <Typography sx={formSx.setDetailsUploadHint}>Загрузить</Typography>
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
                            sx={formSx.setDetailsPreviewCard(aspectRatio)}
                            onClick={() => setVideoPreview(defaultPreviewUrl)}

                        >
                            <Box
                                component="img"
                                src={defaultPreviewUrl}
                                alt="preview"
                                sx={formSx.setDetailsPreviewCover}
                            />
                        </Paper>
                    </Stack>
                    <Typography variant="subtitle2" sx={formSx.setDetailsTagsTitle}>
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
                            sx={formSx.setDetailsTagField(tag.length > 50)}
                        />
                    ))}
                </Box>

                <Box sx={formSx.setDetailsRight}>
                    <Typography variant="subtitle2" sx={formSx.setDetailsSectionTitle}>
                        Предпросмотр
                    </Typography>

                    <Paper
                        sx={formSx.setDetailsPlayerPaper(aspectRatio)}
                    >
                        <Box
                            component="video"
                            src={videoUrl}
                            onLoadedMetadata={handleLoadedMetadata}
                            poster={videoPreview ?? undefined}
                            controls
                            sx={formSx.setDetailsPlayer}
                        />
                    </Paper>
                </Box>
            </Stack >

            <Stack spacing={1.5} alignItems="flex-end" sx={formSx.setDetailsActions}>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={isInvalid || uploading}
                    sx={formSx.setDetailsPublishButton}
                >
                    {uploading ? "Публикация..." : "Опубликовать"}
                </Button>
            </Stack>
        </>
    );
}

