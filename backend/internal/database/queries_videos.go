package database

const upsertVideoStatsFromViewQuery = `
WITH ins AS (
  INSERT INTO video_view_events(video_id, watched_seconds, created_at)
  VALUES ($1, GREATEST($2, 1), NOW())
  RETURNING video_id
),
agg AS (
  SELECT
    v.video_id,
    COALESCE(
      SUM(
        CASE
          WHEN e.watched_seconds >= LEAST(30, GREATEST(v.duration_seconds, 1)) THEN 1
          ELSE 0
        END
      ),
      0
    )::bigint AS views_7d,
    COALESCE(
      AVG(
        LEAST(
          e.watched_seconds::float8 / GREATEST(v.duration_seconds, 1)::float8,
          1.0
        )
      ),
      0
    )::float8 AS avg_watch_ratio_7d
  FROM videos v
  LEFT JOIN video_view_events e
    ON e.video_id = v.video_id
   AND e.created_at >= NOW() - INTERVAL '7 day'
  WHERE v.video_id = (SELECT video_id FROM ins LIMIT 1)
  GROUP BY v.video_id
)
INSERT INTO video_stats(video_id, views_7d, avg_watch_ratio_7d, updated_at)
SELECT video_id, views_7d, avg_watch_ratio_7d, NOW()
FROM agg
ON CONFLICT (video_id) DO UPDATE
SET
  views_7d = EXCLUDED.views_7d,
  avg_watch_ratio_7d = EXCLUDED.avg_watch_ratio_7d,
  updated_at = NOW();
`

const searchVideosQuery = `
SELECT
	v.video_id,
	v.user_id,
	v.video_url,
	v.preview_url,
	v.name,
	v.created_at,
	u.username,
	u.avatar_url,
	v.views
FROM videos v
INNER JOIN users u ON u.user_id = v.user_id
WHERE v.status IN ('uploaded', 'processed')
  AND (
	v.name ILIKE '%' || $1 || '%'
	OR EXISTS (
	  SELECT 1
	  FROM unnest(v.tags) t
	  WHERE t ILIKE '%' || $1 || '%'
	)
	OR u.username ILIKE '%' || $1 || '%'
  )
ORDER BY v.created_at DESC
LIMIT $2 OFFSET $3;
`
