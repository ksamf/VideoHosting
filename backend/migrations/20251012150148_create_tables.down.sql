DROP TRIGGER IF EXISTS user_video_actions_set_updated_at ON user_video_actions;

DROP TRIGGER IF EXISTS videos_set_updated_at ON videos;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;

DROP FUNCTION IF EXISTS set_updated_at ();

DROP TABLE IF EXISTS user_tag_affinity;

DROP TABLE IF EXISTS user_author_affinity;

DROP TABLE IF EXISTS video_stats;

DROP TABLE IF EXISTS comments;

DROP TABLE IF EXISTS user_video_actions;

DROP TABLE IF EXISTS videos;

DROP TABLE IF EXISTS user_subscriptions;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS languages;

DROP TABLE IF EXISTS video_view_events;

DROP TYPE IF EXISTS reaction;

DROP TYPE IF EXISTS video_status;