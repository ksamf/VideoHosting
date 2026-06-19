package database

const recommendationsQuery = `
WITH candidates AS (
  SELECT
    v.video_id,
    v.user_id,
    v.video_url,
    v.name,
    v.description,
    v.language_id,
    v.qualities,
    v.duration_seconds,
    v.tags,
    v.preview_url,
    v.status,
    v.views,
    v.likes,
    v.dislikes,
    v.upscaled,
    v.created_at,
    v.updated_at,
    COALESCE(vs.views_7d, 0)::float8 AS views_7d,
    COALESCE(vs.avg_watch_ratio_7d, 0)::float8 AS watch_ratio_7d,
    COALESCE(uaa.score, 0)::float8 AS author_affinity,
    COALESCE((
      SELECT AVG(uta.score)::float8
      FROM user_tag_affinity uta
      WHERE uta.user_id = $1
        AND uta.tag = ANY(v.tags)
    ), 0)::float8 AS tag_affinity
  FROM videos v
  LEFT JOIN video_stats vs ON vs.video_id = v.video_id
  LEFT JOIN user_author_affinity uaa ON uaa.user_id = $1 AND uaa.author_id = v.user_id
  LEFT JOIN user_video_actions uva ON uva.user_id = $1 AND uva.video_id = v.video_id
  WHERE v.status = 'uploaded'
    AND v.user_id <> $1
    AND uva.video_id IS NULL
),
scored AS (
  SELECT
    c.*,
    LEAST(1.0, 0.7*c.author_affinity + 0.3*c.tag_affinity) AS personal,
    LN(1.0 + c.views_7d) AS popularity_raw,
    EXP(-EXTRACT(EPOCH FROM (NOW() - c.created_at))/3600.0/72.0) AS freshness,
    (0.5 * (c.likes::float8 / GREATEST((c.likes + c.dislikes)::float8, 1.0))
     + 0.5 * LEAST(1.0, GREATEST(0.0, c.watch_ratio_7d))) AS quality
  FROM candidates c
),
norm AS (
  SELECT
    s.*,
    MIN(s.popularity_raw) OVER () AS pop_min,
    MAX(s.popularity_raw) OVER () AS pop_max
  FROM scored s
),
final AS (
  SELECT
    n.*,
    CASE
      WHEN (n.pop_max - n.pop_min) <= 1e-9 THEN 0.0
      ELSE (n.popularity_raw - n.pop_min) / (n.pop_max - n.pop_min)
    END AS popularity
  FROM norm n
)
SELECT
  video_id, user_id, video_url, name, description, language_id, qualities, duration_seconds,
  tags, preview_url, status, views, likes, dislikes, upscaled, created_at, updated_at
FROM final
ORDER BY
  ($2 * personal + $3 * popularity + $4 * freshness + $5 * quality) DESC,
  created_at DESC
LIMIT $6 OFFSET $7;
`

const refreshVideoStatsFromReactionsQuery = `
INSERT INTO video_stats(video_id, likes_7d, dislikes_7d, updated_at)
SELECT
  $1,
  COUNT(*) FILTER (WHERE reaction = 'like' AND updated_at >= NOW() - INTERVAL '7 day'),
  COUNT(*) FILTER (WHERE reaction = 'dislike' AND updated_at >= NOW() - INTERVAL '7 day'),
  NOW()
FROM user_video_actions
WHERE video_id = $1
ON CONFLICT (video_id) DO UPDATE
SET
  likes_7d = EXCLUDED.likes_7d,
  dislikes_7d = EXCLUDED.dislikes_7d,
  updated_at = NOW();
`

const upsertAuthorAffinityFromSubscribeQuery = `
INSERT INTO user_author_affinity(user_id, author_id, score, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id, author_id) DO UPDATE
SET
  score = GREATEST(0.0, user_author_affinity.score + EXCLUDED.score),
  updated_at = NOW();
`

const upsertAuthorAffinityFromViewQuery = `
WITH v AS (
  SELECT user_id AS author_id, GREATEST(duration_seconds, 1) AS dur
  FROM videos
  WHERE video_id = $2
),
s AS (
  SELECT
    author_id,
    LEAST($3::float8 / dur::float8, 1.0)
    + CASE WHEN $3 >= LEAST(30, dur) THEN 0.3 ELSE 0 END AS signal
  FROM v
)
INSERT INTO user_author_affinity(user_id, author_id, score, updated_at)
SELECT $1, author_id, signal, NOW()
FROM s
ON CONFLICT (user_id, author_id) DO UPDATE
SET
  score = user_author_affinity.score + EXCLUDED.score,
  updated_at = NOW();
`

const upsertTagAffinityFromViewQuery = `
WITH v AS (
  SELECT tags, GREATEST(duration_seconds, 1) AS dur
  FROM videos
  WHERE video_id = $2
),
s AS (
  SELECT
    UNNEST(tags) AS tag,
    (LEAST($3::float8 / dur::float8, 1.0)
     + CASE WHEN $3 >= LEAST(30, dur) THEN 0.3 ELSE 0 END) * 0.5 AS signal
  FROM v
)
INSERT INTO user_tag_affinity(user_id, tag, score, updated_at)
SELECT $1, tag, signal, NOW()
FROM s
ON CONFLICT (user_id, tag) DO UPDATE
SET
  score = user_tag_affinity.score + EXCLUDED.score,
  updated_at = NOW();
`
