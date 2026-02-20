import { Modal, Box, Typography, Input, Button, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { login } from "../../api/auth";
import useFormAuth from "../../hooks/useFormAuth";
import { useTheme } from "@mui/material/styles";

export default function LoginModal() {
    const navigate = useNavigate();
    const theme = useTheme();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const isFormValid = email.trim() !== "" && password.trim() !== "";

    const { loading, error, handleSubmit } = useFormAuth(async (formData: { email: string; password: string }) => {
        await login(formData.email.trim(), formData.password);
        return true;
    });

    const onSubmit = async (e: FormEvent<HTMLElement>) => {
        e.preventDefault();
        if (!isFormValid) return;
        await handleSubmit({ email, password });
    };

    const inputSx = (theme) => ({
        color: theme.palette.text.primary,
        caretColor: theme.palette.text.primary,
        "&:before": { borderBottom: `1px solid ${theme.palette.muted.main}` },
        "&:hover:not(.Mui-disabled):before": { borderBottom: `1px solid ${theme.palette.text.secondary}` },
        "&.Mui-focused:after": { borderBottom: `2px solid ${theme.palette.text.primary}` },
    });

    return (
        <Modal open onClose={() => navigate(-1)}>
            <Box
                sx={(theme) => ({
                    color: theme.palette.text.secondary,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: theme.palette.background.paper,
                    p: 2.5,
                    borderRadius: 2,
                    textAlign: "center",
                })}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Вход</Typography>
                    <IconButton onClick={() => navigate(-1)} sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Input
                        autoFocus
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        sx={inputSx(theme)}
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        sx={inputSx(theme)}
                    />

                    {error && (
                        <Typography color="error" fontSize={12}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        disabled={!isFormValid || loading}
                        sx={(theme) => ({
                            bgcolor: theme.palette.text.primary,
                            color: theme.palette.background.default,
                            "&:hover": { bgcolor: theme.palette.text.secondary },
                            "&.Mui-disabled": { bgcolor: "#555555", color: "#999" },
                        })}
                    >
                        {loading ? "Загрузка..." : "Вход"}
                    </Button>
                    <Button
                        type="button"
                        component={Link}
                        to="/register"
                        sx={(theme) => ({
                            bgcolor: theme.palette.divider,
                            color: "#777777",
                            "&:hover": {
                                bgcolor: theme.palette.text.primary,
                                color: theme.palette.background.default,
                            },
                        })}
                    >
                        {loading ? "Загрузка..." : "Регистрация"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
