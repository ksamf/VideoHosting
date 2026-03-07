package database

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ActionModel struct {
	Pool *pgxpool.Pool
}

type Action struct {
	UserId        uuid.UUID `json:"user_id"`
	VideoId       uuid.UUID `json:"video_id"`
	UserName      string    `json:"user_name"`
	UserAvatarUrl string    `json:"user_avatar_url"`
	Reaction      *string   `json:"reaction"`
	Comment       string    `json:"comment"`
	Views         int64     `json:"views"`
	CreatedAt     time.Time `json:"viewed_at"`
}
type Comment struct {
	CommentId     uuid.UUID `json:"comment_id"`
	UserId        uuid.UUID `json:"user_id"`
	VideoId       uuid.UUID `json:"video_id"`
	Text          string    `json:"text"`
	CreatedAt     time.Time `json:"created_at"`
	UserName      string    `json:"username"`
	UserAvatarUrl string    `json:"user_avatar_url"`
}

func (m *ActionModel) Insert(userId, videoId uuid.UUID) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := `INSERT INTO user_video_actions(user_id, video_id) VALUES($1, $2) ON CONFLICT DO NOTHING`
	_, err := m.Pool.Exec(ctx, query, userId, videoId)
	if err != nil {
		return fmt.Errorf("failed insert action:%w", err)
	}
	return nil

}
func (m *ActionModel) Get(userId, videoId uuid.UUID) (*Action, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	query := `
	SELECT user_id, video_id, reaction, created_at
	FROM user_video_actions
	WHERE user_id=$1 AND video_id=$2`
	var a Action
	row := m.Pool.QueryRow(ctx, query, userId, videoId)
	err := row.Scan(&a.UserId, &a.VideoId, &a.Reaction, &a.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed get action:%w", err)
	}
	return &a, nil
}
func (m *ActionModel) UpdateView(userId, videoId uuid.UUID, view int) error {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO user_video_actions(user_id, video_id, views, last_viewed_at)
		VALUES($1, $2, $3, NOW())
		ON CONFLICT (user_id, video_id) DO UPDATE
		SET
			views = user_video_actions.views + EXCLUDED.views,
			last_viewed_at = NOW()
	`
	res, err := m.Pool.Exec(ctx, query, userId, videoId, view)
	if err != nil {
		return err
	}

	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for user_id:%s, video_id:%s", userId, videoId)
	}

	return nil
}
func (m *ActionModel) UpdateReaction(userId, videoId uuid.UUID, reaction string) error {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	var newReaction *string
	current, _ := m.Get(userId, videoId)
	if current != nil && current.Reaction != nil && *current.Reaction == reaction {
		newReaction = nil
	} else {
		newReaction = &reaction
	}
	query := "UPDATE user_video_actions SET reaction = $3::reaction WHERE user_id=$1 AND video_id = $2"
	res, err := m.Pool.Exec(ctx, query, userId, videoId, newReaction)
	if err != nil {
		return err
	}

	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for user_id:%s, video_id:%s", userId, videoId)
	}

	return nil
}
func (m *ActionModel) ClearReaction(userId, videoId uuid.UUID) error {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE user_video_actions SET reaction = NULL WHERE user_id=$1 AND video_id = $2"
	res, err := m.Pool.Exec(ctx, query, userId, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for user_id:%s, video_id:%s", userId, videoId)
	}

	return nil
}
func (m *ActionModel) GetComments(videoId uuid.UUID, limit, offset int) ([]*Comment, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	query := `
	SELECT u.username, u.avatar_url,c.comment_id, c.comment_text, c.created_at
	FROM comments c
	INNER JOIN users u ON u.user_id=c.user_id
	WHERE video_id=$1
	ORDER BY c.created_at DESC, c.comment_id DESC
	LIMIT $2 OFFSET $3
	`
	var comments []*Comment
	rows, err := m.Pool.Query(ctx, query, videoId, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed get rows:%w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var c Comment
		if err := rows.Scan(&c.UserName, &c.UserAvatarUrl, &c.CommentId, &c.Text, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed row scan:%w", err)
		}
		comments = append(comments, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return comments, nil
}
func (m *ActionModel) AddComment(commentId, userId, videoId uuid.UUID, comment string) error {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := "INSERT INTO comments(comment_id, user_id, video_id, comment_text) VALUES($1, $2, $3, $4)"
	res, err := m.Pool.Exec(ctx, query, commentId, userId, videoId, comment)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for user_id:%s, video_id:%s", userId, videoId)
	}
	return nil
}

func (m *ActionModel) CountReactions(videoId uuid.UUID) (int, int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `SELECT
  			COUNT(*) FILTER (WHERE reaction = 'like') AS likes,
  			COUNT(*) FILTER (WHERE reaction = 'dislike') AS dislikes
			FROM user_video_actions
			WHERE video_id = $1;`
	var likes, dislikes int
	row := m.Pool.QueryRow(ctx, query, videoId)
	err := row.Scan(&likes, &dislikes)
	if err != nil {
		return 0, 0, err
	}
	return likes, dislikes, nil
}

func (m *ActionModel) SubUnsub(userId, channelId uuid.UUID, action string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	var query string
	if action == "sub" {
		query = "INSERT INTO user_subscriptions(user_id, channel_id) VALUES($1, $2) ON CONFLICT DO NOTHING"
	} else {
		query = "DELETE FROM user_subscriptions WHERE user_id=$1 AND channel_id=$2"
	}
	_, err := m.Pool.Exec(ctx, query, userId, channelId)
	if err != nil {
		return fmt.Errorf("failed to channel action:%w", err)
	}
	return nil
}
func (m *ActionModel) GetWatchedVideo(userId uuid.UUID, limit, offset int) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT v.video_id, v.user_id, v.video_url, v.preview_url, v.name, v.created_at, u.username, u.avatar_url, v.views 
	FROM user_video_actions uva 
	INNER JOIN videos v ON v.video_id=uva.video_id 
	INNER JOIN users u ON u.user_id=v.user_id
	WHERE uva.user_id=$1
	ORDER BY uva.last_viewed_at DESC NULLS LAST, uva.created_at DESC, v.video_id DESC
	LIMIT $2 OFFSET $3`
	rows, err := m.Pool.Query(ctx, query, userId, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed get watched videos:%w", err)
	}
	var videos []*Video
	for rows.Next() {
		var video Video
		if err := rows.Scan(
			&video.VideoId,
			&video.UserId,
			&video.VideoUrl,
			&video.PreviewUrl,
			&video.Name,
			&video.CreatedAt,
			&video.UserName,
			&video.UserAvatarUrl,
			&video.Views,
		); err != nil {
			return nil, fmt.Errorf("failed scan:%w", err)
		}
		videos = append(videos, &video)
	}
	return videos, nil
}
func (m *ActionModel) GetLikedVideo(userId uuid.UUID, limit, offset int) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT v.video_id, v.user_id, v.video_url, v.preview_url, v.name, v.created_at, u.username, u.avatar_url, v.views 
	FROM user_video_actions uva 
	INNER JOIN videos v ON v.video_id=uva.video_id 
	INNER JOIN users u ON u.user_id=v.user_id
	WHERE uva.user_id=$1 AND uva.reaction='like'
	ORDER BY uva.created_at DESC, v.video_id DESC
	LIMIT $2 OFFSET $3`
	rows, err := m.Pool.Query(ctx, query, userId, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed get liked videos:%w", err)
	}
	var videos []*Video
	for rows.Next() {
		var video Video
		if err := rows.Scan(
			&video.VideoId,
			&video.UserId,
			&video.VideoUrl,
			&video.PreviewUrl,
			&video.Name,
			&video.CreatedAt,
			&video.UserName,
			&video.UserAvatarUrl,
			&video.Views,
		); err != nil {
			return nil, fmt.Errorf("failed scan:%w", err)
		}
		videos = append(videos, &video)
	}
	return videos, nil
}
func (m *ActionModel) GetVideoViews(videoId uuid.UUID) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "SELECT SUM(views) as sum_views FROM user_video_actions WHERE video_id=$1"
	row := m.Pool.QueryRow(ctx, query, videoId)
	var views int
	if err := row.Scan(&views); err != nil {
		return 0, fmt.Errorf("failed count video views:%w", err)
	}
	return views, nil
}
