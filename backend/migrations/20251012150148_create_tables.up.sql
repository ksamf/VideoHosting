CREATE TABLE IF NOT EXISTS languages (
    language_id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    language VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    interests VARCHAR(50) [] DEFAULT '{}',
    subscriptions BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    channel_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, channel_id)
);

CREATE TYPE video_status AS ENUM ('uploaded', 'processing', 'processed', 'failed');

CREATE TABLE IF NOT EXISTS videos (
    video_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(5000),
    language_id INT REFERENCES languages (language_id),
    qualities INTEGER[],
    duration_seconds INT NOT NULL DEFAULT 0,
    tags VARCHAR(50) [] DEFAULT '{}',
    preview_url TEXT NOT NULL,
    status video_status NOT NULL DEFAULT 'uploaded',
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0 CHECK (likes >= 0),
    dislikes BIGINT DEFAULT 0 CHECK (dislikes >= 0),
    upscaled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE reaction AS ENUM ('like', 'dislike');

CREATE TABLE IF NOT EXISTS user_video_actions (
    user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos (video_id) ON DELETE CASCADE,
    reaction reaction,
    views INT DEFAULT 0,
    watched_seconds INT NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMP,
    is_view_counted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id UUID PRIMARY KEY,
    video_id UUID REFERENCES videos (video_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS video_stats (
    video_id UUID PRIMARY KEY REFERENCES videos (video_id) ON DELETE CASCADE,
    views_7d BIGINT NOT NULL DEFAULT 0,
    likes_7d BIGINT NOT NULL DEFAULT 0,
    dislikes_7d BIGINT NOT NULL DEFAULT 0,
    avg_watch_ratio_7d DOUBLE PRECISION NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_author_affinity (
    user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    author_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, author_id)
);

CREATE TABLE IF NOT EXISTS user_tag_affinity (
    user_id UUID REFERENCES users (user_id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tag)
);

CREATE TABLE IF NOT EXISTS video_view_events (
    event_id BIGSERIAL PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES videos (video_id) ON DELETE CASCADE,
    watched_seconds INT NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_view_events_video_created ON video_view_events (video_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subs_channel ON user_subscriptions (channel_id);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos (user_id);

CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos (created_at);

CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_videos_status ON videos (status);

CREATE INDEX IF NOT EXISTS idx_videos_status_created_at ON videos (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_user_created_at ON videos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_language_id ON videos (language_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_user_video_actions_video ON user_video_actions (video_id);

CREATE INDEX IF NOT EXISTS idx_user_video_actions_reaction ON user_video_actions (video_id, reaction);

CREATE INDEX IF NOT EXISTS idx_user_video_actions_user_updated ON user_video_actions (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_video_actions_video_updated ON user_video_actions (video_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_video ON comments (video_id);

CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS videos_set_updated_at ON videos;

CREATE TRIGGER videos_set_updated_at
BEFORE UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS user_video_actions_set_updated_at ON user_video_actions;

CREATE TRIGGER user_video_actions_set_updated_at
BEFORE UPDATE ON user_video_actions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();