UPDATE videos
SET status = 'uploaded'
WHERE status = 'processed';

ALTER TYPE video_status RENAME TO video_status_old;

CREATE TYPE video_status AS ENUM ('processing', 'uploaded', 'failed');

ALTER TABLE videos
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE videos
    ALTER COLUMN status TYPE video_status
    USING status::text::video_status;

ALTER TABLE videos
    ALTER COLUMN status SET DEFAULT 'processing';

DROP TYPE video_status_old;
