import { Modal, Box, Typography, Input, Button, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { login } from "../../api/auth";
import useFormAuth from "../../hooks/useFormAuth";
import { formSx } from "../../styles/theme";

export default function LoginModal() {
    const navigate = useNavigate();

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

    return (
        <Modal open onClose={() => navigate(-1)}>
            <Box sx={formSx.authModal}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Вход</Typography>
                    <IconButton onClick={() => navigate(-1)} sx={formSx.authCloseButton}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Box component="form" onSubmit={onSubmit} sx={formSx.authForm}>
                    <Input
                        autoFocus
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        sx={formSx.authInput}
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        sx={formSx.authInput}
                    />

                    {error && (
                        <Typography color="error" fontSize={12}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        disabled={!isFormValid || loading}
                        sx={formSx.authPrimaryButton}
                    >
                        {loading ? "Загрузка..." : "Вход"}
                    </Button>
                    <Button
                        type="button"
                        component={Link}
                        to="/register"
                        sx={formSx.authSecondaryButton}
                    >
                        {loading ? "Загрузка..." : "Регистрация"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
