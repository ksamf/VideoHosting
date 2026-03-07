import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import VideoGrid from "../components/video/VideoGrid";
import { searchVideos } from "../api/videos";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/sx/page";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";
import type { Video } from "../types/video";

const SEARCH_PAGE_SIZE = 20;

function uniqueByVideoID(list: Video[]): Video[] {
  const seen = new Set<string>();
  return list.filter((video) => {
    if (seen.has(video.video_id)) {
      return false;
    }
    seen.add(video.video_id);
    return true;
  });
}

export default function Search() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [videos, setVideos] = useState<Video[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    if (query.length < 2) {
      setVideos([]);
      setOffset(0);
      setHasMore(false);
      setError(null);
      setLoadingInitial(false);
      return;
    }

    setLoadingInitial(true);
    setError(null);
    setVideos([]);
    setOffset(0);
    setHasMore(false);

    try {
      const result = await searchVideos({ q: query, limit: SEARCH_PAGE_SIZE, offset: 0 });
      const safeResult = Array.isArray(result) ? result : [];
      setVideos(uniqueByVideoID(safeResult));
      setOffset(safeResult.length);
      setHasMore(safeResult.length === SEARCH_PAGE_SIZE);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
    } finally {
      setLoadingInitial(false);
    }
  }, [query]);

  const loadMore = useCallback(async () => {
    if (query.length < 2 || loadingInitial || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const result = await searchVideos({ q: query, limit: SEARCH_PAGE_SIZE, offset });
      const safeResult = Array.isArray(result) ? result : [];
      setVideos((prev) => uniqueByVideoID([...prev, ...safeResult]));
      setOffset((prev) => prev + safeResult.length);
      setHasMore(safeResult.length === SEARCH_PAGE_SIZE);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingInitial, loadingMore, offset, query]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!hasMore || loadingInitial || loadingMore || !loadMoreRef.current || query.length < 2) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loadingInitial, loadingMore, query.length]);

  if (loadingInitial) {
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
        <>
          <VideoGrid videos={videos} />
          {(hasMore || loadingMore) && (
            <Box ref={loadMoreRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              {loadingMore && <CircularProgress size={24} />}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

