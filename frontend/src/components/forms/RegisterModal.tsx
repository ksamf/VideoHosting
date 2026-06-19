import { Modal, Box, Typography, Input, Button, IconButton, Stack, Checkbox, FormControlLabel, Link } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { register } from "../../api/auth";
import useFormAuth from "../../hooks/useFormAuth";
import { formSx } from "../../styles/sx/form";
import { PRIVACY_POLICY_PATH } from "../../utils/privacy";

export default function RegisterModal() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [personalDataConsent, setPersonalDataConsent] = useState<boolean>(false);

    const isValid =
        userName.trim() !== "" && email.trim() !== "" && password.length >= 6 && personalDataConsent;

    const { loading, error, handleSubmit } = useFormAuth(async (formData: { userName: string; email: string; password: string; personalDataConsent: boolean }) => {
        await register(formData.email.trim(), formData.password, formData.userName.trim(), formData.personalDataConsent);
        return true;
    });

    const onSubmit = async (e: FormEvent<HTMLElement>) => {
        e.preventDefault();
        if (!isValid) return;
        await handleSubmit({ email, password, userName, personalDataConsent });
    };

    return (
        <Modal open onClose={() => navigate(-1)}>
            <Box sx={formSx.authModal}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Регистрация</Typography>
                    <IconButton onClick={() => navigate(-1)} sx={formSx.authCloseButton}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Box component="form" onSubmit={onSubmit} sx={formSx.authForm}>
                    <Input
                        autoFocus
                        placeholder="Имя пользователя"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        disabled={loading}
                        sx={formSx.authInput}
                    />

                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        sx={formSx.authInput}
                    />

                    <Input
                        type="password"
                        placeholder="Пароль (от 6 символов)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        sx={formSx.authInput}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={personalDataConsent}
                                onChange={(e) => setPersonalDataConsent(e.target.checked)}
                                disabled={loading}
                            />
                        }
                        label={
                            <Typography fontSize={12}>
                                Я согласен с{" "}
                                <Link component={RouterLink} to={PRIVACY_POLICY_PATH} target="_blank" rel="noopener" underline="always">
                                    Политикой обработки персональных данных
                                </Link>
                            </Typography>
                        }
                        sx={{ m: 0, alignItems: "flex-start" }}
                    />

                    {error && (
                        <Typography color="error" fontSize={12}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        disabled={!isValid || loading}
                        sx={formSx.authPrimaryButton}
                    >
                        {loading ? "Загрузка..." : "Регистрация"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

