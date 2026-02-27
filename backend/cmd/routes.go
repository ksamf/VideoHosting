package main

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
)

func (app *application) routes() http.Handler {
	router := gin.New()
	gin.SetMode(app.config.App.Mode)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     app.config.App.CorsOrigins,
		AllowCredentials: true,
		AllowHeaders:     []string{"Content-Type", "Authorization"},
	}))
	if app.config.App.Mode == gin.DebugMode {
		pprof.Register(router, "/debug/pprof")
	}

	router.GET("api/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	router.Use(gin.Recovery())

	authLimiter := app.auth.RateLimiterWith(time.Minute, app.config.Rate.AuthPerMinute)
	searchLimiter := app.auth.RateLimiterWith(time.Minute, app.config.Rate.SearchPerMinute)
	writeLimiter := app.auth.RateLimiterWith(time.Minute, app.config.Rate.WritePerMinute)
	viewLimiter := app.auth.RateLimiterWith(time.Minute, app.config.Rate.ViewsPerMinute)
	videoUploadLimit := maxBodyBytes(app.config.Upload.VideoMaxBytes)
	avatarUploadLimit := maxBodyBytes(app.config.Upload.AvatarMaxBytes)

	router.POST("api/signup", authLimiter, app.auth.Signup)
	router.POST("api/login", authLimiter, app.auth.Login)
	router.POST("api/logout", app.auth.AuthMiddleware, writeLimiter, app.auth.Logout)
	router.GET("api/me", app.auth.AuthMiddleware, app.auth.Me)

	router.GET("api/video", app.handlers.Video.GetAll) //query limit=10, offset=0
	router.GET("api/search", searchLimiter, app.handlers.Video.Search)
	router.GET("api/video/:id", app.handlers.Video.Get)
	router.POST("api/video/upload", videoUploadLimit, app.auth.AuthMiddleware, writeLimiter, app.handlers.Video.Upload)
	router.DELETE("api/video/:id", app.auth.AuthMiddleware, app.handlers.Video.Delete)
	router.GET("api/video/:id/comments", app.handlers.Action.Comments)
	router.POST("api/video/:id/comment", app.auth.AuthMiddleware, writeLimiter, app.handlers.Action.AddComment)
	router.POST("api/video/:id/reaction", app.auth.AuthMiddleware, writeLimiter, app.handlers.Action.Reaction) //query r=like||dislike
	router.GET("api/video/:id/reaction", app.auth.AuthMiddleware, app.handlers.Action.GetReaction)
	// router.POST("api/video/:id/upscale", app.handlers.Video.Upscale)                    //query real=true||false
	//default create sub for original language and english for translate sub query lang=fr||ru||...
	// router.GET("/video/:id/sub", app.handlers.Video.Subtitles)

	router.GET("api/user/:id", app.handlers.User.Get)
	router.DELETE("api/user/:id", app.auth.AuthMiddleware, app.handlers.User.Delete)
	router.GET("api/user/video/:id", app.handlers.User.GetByVideoId)
	router.POST("api/user/:id/upload", avatarUploadLimit, app.auth.AuthMiddleware, writeLimiter, app.handlers.User.UploadAvatar)
	router.POST("api/user/channel/:id", app.auth.AuthMiddleware, writeLimiter, app.handlers.Action.SubUnsubAction) //query action=sub||unsub
	router.GET("api/channel/:id/subcount", app.auth.AuthMiddleware, app.handlers.User.GetSubscriptionsCount)       //query period=30(days)
	router.GET("api/user/:id/sub", app.auth.AuthMiddleware, app.handlers.User.GetSubscriptions)
	router.GET("api/user/:id/sub/video", app.auth.AuthMiddleware, app.handlers.User.GetSubscriptionsVideo)
	router.GET("api/user/:id/watched", app.auth.AuthMiddleware, app.handlers.User.GetWatchedVideo)
	router.GET("api/user/:id/liked", app.auth.AuthMiddleware, app.handlers.User.GetLikedVideo)
	router.GET("api/user/:id/video", app.auth.AuthMiddleware, app.handlers.User.Videos)
	router.GET("api/channel/:id/views", app.auth.AuthMiddleware, app.handlers.User.GetViewsCount) //query period=30(days)
	router.GET("api/channel/:id/subscribed", app.auth.AuthMiddleware, app.handlers.User.Subscribed)
	router.POST("api/video/:id/views", app.auth.OptionalAuthMiddleware, viewLimiter, app.handlers.User.ViewVideo) //body deviceId
	router.GET("api/user/:id/recommendations", app.auth.AuthMiddleware, app.handlers.User.GetRecommendation)      //query limit=10, offset=0

	return router
}

func maxBodyBytes(limit int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > limit {
			c.AbortWithStatusJSON(http.StatusRequestEntityTooLarge, gin.H{"error": "payload too large"})
			return
		}

		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, limit)
		c.Next()
	}
}
