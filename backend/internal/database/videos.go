package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type VideoModel struct {
	Pool *pgxpool.Pool
}

type Video struct {
	VideoId         uuid.UUID  `json:"video_id"`
	UserId          uuid.UUID  `json:"user_id"`
	VideoUrl        string     `json:"video_url"`
	UserName        string     `json:"username"`
	UserAvatarUrl   string     `json:"user_avatar_url"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	LanguageId      int        `json:"language_id"`
	Language        string     `json:"language"`
	Qualities       []int      `json:"qualities"`
	DurationSeconds int        `json:"duration_seconds"`
	PreviewUrl      string     `json:"preview_url"`
	Tags            []string   `json:"tags"`
	Status          string     `json:"status"`
	Views           int64      `json:"views"`
	Likes           int64      `json:"likes"`
	Dislikes        int64      `json:"dislikes"`
	Upscaled        bool       `json:"upscaled"`
	CreatedAt       *time.Time `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at"`
	CommentCount    int64      `json:"comment_count"`
}

func (m *VideoModel) Insert(video *Video) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
	defer cancel()
	query := "INSERT INTO videos(video_id, user_id, video_url, name, description, preview_url,tags, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8)"
	_, err := m.Pool.Exec(ctx, query, video.VideoId, video.UserId, video.VideoUrl, video.Name, video.Description, video.PreviewUrl, video.Tags, video.Status)
	if err != nil {
		return err
	}
	return nil
}

func (m *VideoModel) GetAll(limit, offset int) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := "SELECT v.video_id, v.user_id, v.video_url, v.preview_url, v.name, v.created_at, u.username, u.avatar_url, v.views FROM videos v INNER JOIN users u ON u.user_id=v.user_id WHERE v.status='uploaded' LIMIT $1 OFFSET $2 "
	rows, err := m.Pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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
			return nil, err
		}
		videos = append(videos, &video)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return videos, nil
}

func (m *VideoModel) GetByID(id uuid.UUID) (*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT 
			v.video_id,
			v.user_id,
			v.video_url,
			v.name,
			v.description,
			v.qualities,
			v.tags,
			v.views,
			v.likes,
			v.dislikes,
			v.upscaled,
			v.created_at,
			u.username
		FROM videos v 
		INNER JOIN users u ON u.user_id=v.user_id 
		WHERE v.video_id = $1;
	`

	row := m.Pool.QueryRow(ctx, query, id)

	var v Video
	var lang sql.NullString

	err := row.Scan(&v.VideoId, &v.UserId, &v.VideoUrl, &v.Name, &v.Description, &v.Qualities, &v.Tags, &v.Views, &v.Likes, &v.Dislikes, &v.Upscaled, &v.CreatedAt, &v.UserName)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if lang.Valid {
		v.Language = lang.String
	} else {
		v.Language = ""
	}
	return &v, nil
}

func (m *VideoModel) Delete(id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := "DELETE FROM videos WHERE video_id=$1"
	_, err := m.Pool.Exec(ctx, query, id)
	return err
}

func (m *VideoModel) GetLanguage(id uuid.UUID) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()
	query := `SELECT l.code 
	FROM languages AS l 
	JOIN videos AS v ON v.video_id = $1
	WHERE v.language_id = l.language_id`
	row := m.Pool.QueryRow(ctx, query, id)
	var lang string
	err := row.Scan(&lang)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return lang, nil
}
func (m *VideoModel) UpdateStatus(videoId uuid.UUID, status string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET status=$1 WHERE video_id = $2`
	res, err := m.Pool.Exec(ctx, query, status, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateLanguage(videoId uuid.UUID, lang string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET language_id = (SELECT language_id FROM languages WHERE code = $1) WHERE video_id = $2`
	res, err := m.Pool.Exec(ctx, query, lang, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateUpscaled(videoId uuid.UUID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET upscaled = true WHERE video_id = $1`
	res, err := m.Pool.Exec(ctx, query, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateQuality(videoId uuid.UUID, heights []int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET qualities = $1 WHERE video_id = $2`
	res, err := m.Pool.Exec(ctx, query, heights, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateViews(videoId uuid.UUID, views int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET views = views + $1 WHERE video_id = $2`
	res, err := m.Pool.Exec(ctx, query, views, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateLikes(videoId uuid.UUID, likes int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET likes = likes + $1 WHERE video_id = $2`
	res, err := m.Pool.Exec(ctx, query, likes, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateDislikes(videoId uuid.UUID, dislikes int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET dislikes = dislikes + $1 WHERE video_id = $2`
	res, err := m.Pool.Exec(ctx, query, dislikes, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}
func (m *VideoModel) UpdateLikesDislikes(videoId uuid.UUID, likes int, dislikes int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	query := `UPDATE videos SET likes = $1, dislikes = $2 WHERE video_id = $3`
	res, err := m.Pool.Exec(ctx, query, likes, dislikes, videoId)
	if err != nil {
		return err
	}
	rows := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no rows updated for video_id:%s", videoId)
	}
	return nil
}

func (m *VideoModel) UpsertVideoStatsFromView(videoID uuid.UUID, watchedSeconds int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.Pool.Exec(ctx, upsertVideoStatsFromViewQuery, videoID, watchedSeconds)
	return err
}

func (m *VideoModel) Search(query string, limit, offset int) ([]*Video, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	if query == "" {
		return []*Video{}, nil
	}

	rows, err := m.Pool.Query(ctx, searchVideosQuery, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	videos := make([]*Video, 0, limit)
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
			return nil, err
		}
		videos = append(videos, &video)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return videos, nil
}
