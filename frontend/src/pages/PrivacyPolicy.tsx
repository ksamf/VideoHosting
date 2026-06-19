import { Box, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PRIVACY_POLICY_VERSION } from "../utils/privacy";

export default function PrivacyPolicy() {
    return (
        <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h5" component="h1" fontWeight={600}>
                    Политика обработки персональных данных
                </Typography>
                <Typography color="text.secondary" fontSize={14}>
                    Версия: {PRIVACY_POLICY_VERSION}
                </Typography>
                <Typography>
                    Сервис обрабатывает данные, которые нужны для регистрации, авторизации, загрузки и просмотра
                    контента: email, имя пользователя, хеш пароля, идентификаторы аккаунта и сессии, IP-адрес, аватар,
                    видео, превью, описания, теги, комментарии, реакции, подписки и статистику просмотров.
                </Typography>
                <Typography>
                    Для авторизации и работы сервиса используются cookie. Для учета просмотров и устойчивой работы
                    интерфейса может использоваться localStorage, включая идентификатор устройства.
                </Typography>
                <Typography>
                    Аватар, имя канала, видео, превью, описания, теги и комментарии могут быть опубликованы в сервисе
                    и доступны другим пользователям.
                </Typography>
                <Typography>
                    Данные используются для создания аккаунта, защиты доступа, отображения пользовательского контента,
                    подсчета просмотров, реакций, подписок и рекомендаций. Согласие на обработку персональных данных
                    фиксируется при регистрации.
                </Typography>
                <Typography>
                    Вернуться на{" "}
                    <Link component={RouterLink} to="/" underline="always">
                        главную страницу
                    </Link>
                    .
                </Typography>
            </Stack>
        </Box>
    );
}
