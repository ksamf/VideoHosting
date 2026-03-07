package database

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserModel struct {
	Pool *pgxpool.Pool
}

type User struct {
	UserId        uuid.UUID `json:"user_id"`
	UserName      string    `json:"username"`
	Email         string    `json:"email"`
	Password      string
	AvatarUrl     string    `json:"avatar_url"`
	Subscriptions int       `json:"subscriptions"`
	Interests     []string  `json:"interests"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (m *UserModel) Insert(userId uuid.UUID, username, email, password string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "INSERT INTO users(user_id, username, email, password) VALUES($1, $2, $3, $4)"
	_, err := m.Pool.Exec(ctx, query, userId, username, email, password)
	if err != nil {
		log.Printf("failed insert users:%s", err)
		return fmt.Errorf("failed insert users:%w", err)
	}
	return nil
}
func (m *UserModel) GetByEmail(email string) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "SELECT user_id, username, email, password FROM users WHERE email=$1"
	var u User
	row := m.Pool.QueryRow(ctx, query, email)
	err := row.Scan(&u.UserId, &u.UserName, &u.Email, &u.Password)
	if err != nil {
		return nil, fmt.Errorf("failed get user by email: %w", err)
	}
	return &u, nil
}
func (m *UserModel) GetByID(id uuid.UUID) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "SELECT user_id, username, avatar_url FROM users WHERE user_id=$1"
	var u User
	row := m.Pool.QueryRow(ctx, query, id)
	err := row.Scan(&u.UserId, &u.UserName, &u.AvatarUrl)
	if err != nil {
		return nil, fmt.Errorf("failed get id: %w", err)
	}
	return &u, nil
}

func (m *UserModel) Delete(id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "DELETE FROM users WHERE user_id=$1"
	_, err := m.Pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed delete id: %w", err)
	}
	return nil
}
func (m *UserModel) GetByVideoId(videoId uuid.UUID) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "SELECT u.user_id, u.avatar_url, u.username FROM videos v INNER JOIN users u ON v.user_id=u.user_id WHERE v.video_id=$1"
	row := m.Pool.QueryRow(ctx, query, videoId)
	var user User
	if err := row.Scan(&user.UserId, &user.AvatarUrl, &user.UserName); err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}
func (m *UserModel) UpdateAvatar(userId uuid.UUID, avatar_url string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "UPDATE users SET avatar_url=$1 WHERE user_id=$2"
	res, err := m.Pool.Exec(ctx, query, avatar_url, userId)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for user_id:%s", userId)
	}
	return nil
}
func (m *UserModel) GetSubscriptionsCount(channelId uuid.UUID, periodDays int) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if periodDays < 0 || periodDays > 365 {
		return 0, errors.New("invalid period")
	}
	query := `
		SELECT COUNT(*)
		FROM user_subscriptions
		WHERE channel_id = $1
		`

	args := []any{channelId}

	if periodDays > 0 {
		query += ` AND created_at > CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')`
		args = append(args, periodDays)
	}

	row := m.Pool.QueryRow(ctx, query, args...)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to scan subscriptions count: %w", err)
	}

	return count, nil
}
func (m *UserModel) GetSubscribed(userId, channelId uuid.UUID) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `SELECT EXISTS (
			  SELECT 1
			  FROM user_subscriptions
			  WHERE user_id = $1 AND channel_id = $2
			);
		`

	row := m.Pool.QueryRow(ctx, query, userId, channelId)
	var isSubscribed bool
	if err := row.Scan(&isSubscribed); err != nil {
		return false, fmt.Errorf("failed to scan subscribed: %w", err)
	}

	return isSubscribed, nil
}
func (m *UserModel) GetSubscriptions(userId uuid.UUID) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := "SELECT u.user_id, u.avatar_url, u.username FROM user_subscriptions us INNER JOIN users u ON us.channel_id = u.user_id WHERE us.user_id=$1"
	rows, err := m.Pool.Query(ctx, query, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to query subscriptions:%w", err)
	}
	var subs []*User
	for rows.Next() {
		var sub User
		if err := rows.Scan(&sub.UserId, &sub.AvatarUrl, &sub.UserName); err != nil {
			return nil, fmt.Errorf("failed to scan subscription:%w", err)
		}
		subs = append(subs, &sub)
	}
	return subs, nil
}
func (m *UserModel) GetSubscriptionsVideo(userId uuid.UUID, limit, offset int) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `SELECT u.avatar_url, u.username, v.video_id, v.video_url, v.views, v.preview_url, v.created_at
			FROM user_subscriptions us
    			INNER JOIN videos v ON us.channel_id = v.user_id
    			INNER JOIN users u ON u.user_id = us.channel_id
			WHERE us.user_id =$1
			ORDER BY v.created_at DESC, v.video_id DESC
			LIMIT $2 OFFSET $3`
	rows, err := m.Pool.Query(ctx, query, userId, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query subscriptions videos:%w", err)
	}
	var videos []*Video
	for rows.Next() {
		var v Video
		if err := rows.Scan(&v.UserAvatarUrl, &v.UserName, &v.VideoId, &v.VideoUrl, &v.Views, &v.PreviewUrl, &v.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan subscription videos:%w", err)
		}
		videos = append(videos, &v)
	}
	return videos, nil

}
func (m *UserModel) Videos(userId uuid.UUID) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `SELECT 
				v.video_id,
    			v.video_url,
    			v.preview_url,
    			v.name,
    			v.created_at,
    			v.views,
				( 
					SELECT avatar_url
				 	FROM users 
				 	WHERE users.user_id = v.user_id
				) AS user_avatar_url,
    			(
    			    SELECT COUNT(*) 
    			    FROM comments c 
    			    WHERE c.video_id = v.video_id
    			) AS comments_count,
    			v.likes,
    			v.dislikes
			FROM videos v
			WHERE v.user_id = $1
			ORDER BY v.created_at DESC;
			`
	rows, err := m.Pool.Query(ctx, query, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to query user videos:%w", err)
	}
	var videos []*Video
	for rows.Next() {
		var v Video
		if err := rows.Scan(&v.VideoId, &v.VideoUrl, &v.PreviewUrl, &v.Name, &v.CreatedAt, &v.Views, &v.UserAvatarUrl, &v.CommentCount, &v.Likes, &v.Dislikes); err != nil {
			return nil, fmt.Errorf("failed to scan user videos:%w", err)
		}
		videos = append(videos, &v)
	}
	return videos, nil
}

func (m *UserModel) GetViewsCount(channelId uuid.UUID, periodDays int) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if periodDays < 0 || periodDays > 365 {
		return 0, errors.New("invalid period")
	}
	query := `
	SELECT COALESCE(SUM(uva.views), 0)
	FROM user_video_actions uva
	WHERE uva.video_id IN (
	SELECT v.video_id
	FROM videos v
	WHERE v.user_id=$1)
		`

	args := []any{channelId}

	if periodDays > 0 {
		query += ` AND uva.created_at > CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')`
		args = append(args, periodDays)
	}

	row := m.Pool.QueryRow(ctx, query, args...)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to scan views count: %w", err)
	}

	return count, nil
}
func (m *UserModel) UpdateSubscriptions(userId uuid.UUID, subs int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE users SET subscriptions=$1 WHERE user_id=$2"
	res, err := m.Pool.Exec(ctx, query, subs, userId)
	if err != nil {
		return fmt.Errorf("failed to update subscriptions: %w", err)
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for user_id:%s", userId)
	}
	return nil

}

func (db *UserModel) GetRecommendations(userID uuid.UUID, limit, offset int) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	const (
		wPersonal   = 0.35
		wPopularity = 0.30
		wFreshness  = 0.20
		wQuality    = 0.15
	)

	rows, err := db.Pool.Query(ctx, recommendationsQuery, userID, wPersonal, wPopularity, wFreshness, wQuality, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*Video, 0, limit)
	for rows.Next() {
		var v Video
		if err := rows.Scan(
			&v.VideoId, &v.UserId, &v.VideoUrl, &v.Name, &v.Description, &v.LanguageId,
			&v.Qualities, &v.DurationSeconds, &v.Tags, &v.PreviewUrl, &v.Status,
			&v.Views, &v.Likes, &v.Dislikes, &v.Upscaled, &v.CreatedAt, &v.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, &v)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}
func (m *VideoModel) RefreshVideoStatsFromReactions(videoID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.Pool.Exec(ctx, refreshVideoStatsFromReactionsQuery, videoID)
	return err
}
func (m *UserModel) UpsertAuthorAffinityFromSubscribe(userID, channelID uuid.UUID, action string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	delta := 0.0
	if action == "sub" {
		delta = 1.0
	} else if action == "unsub" {
		delta = -1.0
	}

	_, err := m.Pool.Exec(ctx, upsertAuthorAffinityFromSubscribeQuery, userID, channelID, delta)
	return err
}

func (m *UserModel) UpsertAffinitiesFromView(userID, videoID uuid.UUID, watchedSeconds int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
	defer cancel()

	tx, err := m.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err = tx.Exec(ctx, upsertAuthorAffinityFromViewQuery, userID, videoID, watchedSeconds); err != nil {
		return err
	}

	if _, err = tx.Exec(ctx, upsertTagAffinityFromViewQuery, userID, videoID, watchedSeconds); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
