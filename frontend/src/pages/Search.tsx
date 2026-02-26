import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import VideoGrid from "../components/video/VideoGrid";
import useFetch from "../hooks/useFetch";
import { searchVideos } from "../api/videos";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/sx/page";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";

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
    return <VideoGridSkeleton items={20} />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <Box sx={pageSx.searchContainer}>
      <Typography variant="h6" sx={pageSx.searchTitle}>
        Результаты поиска: {query || "пустой запрос"}
      </Typography>
      {query.length < 2 ? (
        <Typography sx={pageSx.searchMuted}>
          Введите минимум 2 символа.
        </Typography>
      ) : videos.length === 0 ? (
        <Typography sx={pageSx.searchMuted}>
          Ничего не найдено.
        </Typography>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </Box>
  );
}

