ALTER TYPE video_status RENAME TO video_status_new;

CREATE TYPE video_status AS ENUM ('uploaded', 'processing', 'processed', 'failed');

ALTER TABLE videos
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE videos
    ALTER COLUMN status TYPE video_status
    USING status::text::video_status;

ALTER TABLE videos
    ALTER COLUMN status SET DEFAULT 'uploaded';

DROP TYPE video_status_new;
