import React, { useState } from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import ReactTimeAgo from "react-time-ago";
import { Link } from "react-router-dom";
import { shortenNumRu } from "../../utils/ShortenNumRu";
import { formattedDate } from "../../utils/FormattedDate";

export default function VideoDescription({ video }) {
    const theme = useTheme()
    const [expanded, setExpanded] = useState(false);

    const shortDescription =
        video.description?.slice(0, 180) +
        (video.description?.length > 180 ? "…" : "");
    const uploadDate = video?.created_at ? new Date(video.created_at) : null;

    return (
        <Box
            sx={({
                mt: 2,
                p: 1.5,
                bgcolor: theme.palette.background.surface,
                borderRadius: 2,
                wordWrap: "break-word",
            })}
        >
            <Typography color={(theme) => theme.palette.text.secondary} fontSize={13} mb={0.5}>
                {expanded ? `${video.views} просмотров • ` : `${shortenNumRu(video.views)} просмотров • `}
                {expanded ? formattedDate(video.created_at) : uploadDate && (
                    <ReactTimeAgo
                        date={uploadDate}
                        locale="ru-RU"
                    />
                )}{" "}
                {"• "}
                {video.tags != [] && video.tags?.map((t, i) => (
                    <Link
                        key={i}
                        to={`/tags/${t}`}
                        style={({
                            marginRight: 6,
                            color: theme.palette.link.main,
                            textDecoration: "none",
                        })}
                    >
                        #{t}
                    </Link>
                ))}
            </Typography>

            <Typography
                color="white"
                fontSize={14}
                sx={{ whiteSpace: "pre-line" }}
            >
                {expanded ? video.description : shortDescription}
            </Typography>

            {
                video.description?.length > 180 && (
                    <Button
                        size="small"
                        onClick={() => setExpanded((v) => !v)}
                        sx={(theme) => ({
                            mt: 1,
                            color: theme.palette.text.secondary,
                            textTransform: "none",
                            fontWeight: 500,
                            "&:hover": { color: theme.palette.text.primary },
                        })}
                    >
                        {expanded ? "Свернуть" : "Показать ещё"}
                    </Button>
                )
            }
        </Box >

    )
}

