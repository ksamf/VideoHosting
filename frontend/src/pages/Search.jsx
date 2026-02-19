import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import VideoGrid from "../components/video/VideoGrid";
import useFetch from "../hooks/useFetch";
import { searchVideos } from "../api/videos";
import { PageError, PageLoading } from "../components/common/PageState";

export default function Search() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  const fetchSearch = useCallback(() => {
    if (query.length < 2) return Promise.resolve([]);
    return searchVideos({ q: query, limit: 20, offset: 0 });
  }, [query]);

  const { data, loading, error } = useFetch(fetchSearch);
  const videos = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Результаты поиска: {query || "пустой запрос"}
      </Typography>
      {query.length < 2 ? (
        <Typography sx={{ color: "text.secondary" }}>
          Введите минимум 2 символа.
        </Typography>
      ) : videos.length === 0 ? (
        <Typography sx={{ color: "text.secondary" }}>
          Ничего не найдено.
        </Typography>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </Box>
  );
}
