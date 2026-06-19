import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchVideos } from "../api/videos";
import { searchChannels } from "../api/users";
import { PageError } from "../components/common/PageState";
import { pageSx } from "../styles/sx/page";
import VideoGridSkeleton from "../skeleton/VideoGridSkeleton";
import type { Video } from "../types/video";
import type { User } from "../types/user";
import UserAvatar from "../components/common/UserAvatar";
import SubscribeButton from "../components/video/SubscribeButton";
import { shortenNumRu } from "../utils/ShortenNumRu";
import { formattedDate } from "../utils/FormattedDate";

const SEARCH_PAGE_SIZE = 20;
const CHANNEL_SEARCH_PAGE_SIZE = 10;

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
  const [channels, setChannels] = useState<User[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [channelsError, setChannelsError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    if (query.length === 0) {
      setVideos([]);
      setChannels([]);
      setOffset(0);
      setHasMore(false);
      setError(null);
      setChannelsError(null);
      setLoadingInitial(false);
      return;
    }

    setLoadingInitial(true);
    setError(null);
    setVideos([]);
    setChannels([]);
    setOffset(0);
    setHasMore(false);
    setChannelsError(null);

    try {
      const [videoResult, channelResult] = await Promise.allSettled([
        searchVideos({ q: query, limit: SEARCH_PAGE_SIZE, offset: 0 }),
        searchChannels({ q: query, limit: CHANNEL_SEARCH_PAGE_SIZE, offset: 0 }),
      ]);

      if (videoResult.status === "rejected") {
        throw videoResult.reason;
      }

      const safeVideos = Array.isArray(videoResult.value) ? videoResult.value : [];
      const safeChannels =
        channelResult.status === "fulfilled" && Array.isArray(channelResult.value)
          ? channelResult.value
          : [];

      if (channelResult.status === "rejected") {
        setChannelsError(
          channelResult.reason instanceof Error
            ? channelResult.reason.message
            : "Ошибка загрузки каналов",
        );
      }

      setVideos(uniqueByVideoID(safeVideos));
      setChannels(safeChannels);
      setOffset(safeVideos.length);
      setHasMore(safeVideos.length === SEARCH_PAGE_SIZE);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке данных");
    } finally {
      setLoadingInitial(false);
    }
  }, [query]);

  const loadMore = useCallback(async () => {
    if (query.length === 0 || loadingInitial || loadingMore || !hasMore) {
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
    if (!hasMore || loadingInitial || loadingMore || !loadMoreRef.current || query.length === 0) {
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
      <Typography sx={{ ...pageSx.pageSectionTitle, ...pageSx.searchTitle }}>
        Результаты поиска: {query || "пустой запрос"}
      </Typography>
      {query.length === 0 ? (
        <Typography sx={pageSx.pageStateText}>
          Введите поисковый запрос.
        </Typography>
      ) : channels.length === 0 && videos.length === 0 && !channelsError ? (
        <Typography sx={pageSx.pageStateText}>
          Ничего не найдено.
        </Typography>
      ) : (
        <>
          {channels.length > 0 && (
            <Box sx={pageSx.searchResultBlock}>
              <Typography variant="subtitle1" sx={pageSx.searchSectionTitle}>
                Каналы ({channels.length})
              </Typography>
              <Stack sx={pageSx.searchChannelList}>
                {channels.map((channel) => (
                  <Box key={channel.user_id} sx={pageSx.searchChannelItem}>
                    <Box
                      component={Link}
                      to={`/channel/${channel.user_id}`}
                      sx={pageSx.searchChannelMainLink}
                    >
                      <Box sx={pageSx.searchChannelAvatarWrap}>
                        <UserAvatar username={channel.username} avatar_url={channel.avatar_url} size={88} />
                      </Box>
                      <Box sx={pageSx.searchChannelTextWrap}>
                        <Typography sx={pageSx.searchChannelName}>
                          {channel.username}
                        </Typography>
                        <Typography sx={pageSx.searchChannelMeta}>
                          {shortenNumRu(Number(channel.subscriptions ?? 0))} подписчиков •{" "}
                          {shortenNumRu(Number(channel.videos_count ?? 0))} видео
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={pageSx.searchChannelAction}>
                      <SubscribeButton channelId={channel.user_id} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          {channelsError && (
            <Typography sx={pageSx.searchMuted}>
              Каналы временно недоступны: {channelsError}
            </Typography>
          )}

          {videos.length > 0 && (
            <Box sx={pageSx.searchResultBlock}>
              <Typography variant="subtitle1" sx={pageSx.searchSectionTitle}>
                Видео ({videos.length})
              </Typography>
              <Box sx={pageSx.searchVideoList}>
                {videos.map((video) => (
                  <Box
                    key={video.video_id}
                    component={Link}
                    to={`/watch/${video.video_id}`}
                    sx={pageSx.searchVideoItem}
                  >
                    <Box sx={pageSx.searchVideoThumbWrap}>
                      <Box
                        component="img"
                        src={video.preview_url}
                        alt={video.name}
                        sx={pageSx.searchVideoThumb}
                      />
                    </Box>

                    <Box sx={pageSx.searchVideoMeta}>
                      <Typography sx={pageSx.searchVideoTitle}>
                        {video.name}
                      </Typography>

                      <Typography sx={pageSx.searchVideoStats}>
                        {shortenNumRu(Number(video.views || 0))} просмотров • {formattedDate(video.created_at)}
                      </Typography>

                      <Box sx={pageSx.searchVideoChannelRow}>
                        <UserAvatar
                          username={video.username}
                          avatar_url={video.user_avatar_url}
                          size={28}
                        />
                        <Typography sx={pageSx.searchVideoChannel}>
                          {video.username}
                        </Typography>
                      </Box>

                      {video.description && (
                        <Typography sx={pageSx.searchVideoDescription}>
                          {video.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {(hasMore || loadingMore) && (
            <Box ref={loadMoreRef} sx={pageSx.infiniteLoader}>
              {loadingMore && <CircularProgress size={24} />}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

