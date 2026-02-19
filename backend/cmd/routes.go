package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (app *application) routes() http.Handler {
	router := gin.Default()
	gin.SetMode(app.config.App.Debug)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowCredentials: true,
		AllowHeaders:     []string{"Content-Type", "Authorization"},
	}))

	router.GET("api/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.POST("api/signup", app.auth.Signup)
	router.POST("api/login", app.auth.Login)
	router.POST("api/logout", app.auth.AuthMiddleware, app.auth.Logout)
	router.GET("api/me", app.auth.AuthMiddleware, app.auth.Me)

	router.GET("api/video", app.auth.OptionalAuthMiddleware, app.handlers.Video.GetAll) //query limit=10, offset=0
	router.GET("api/search", app.auth.OptionalAuthMiddleware, app.handlers.Video.Search)
	router.GET("api/video/:id", app.auth.OptionalAuthMiddleware, app.handlers.Video.Get)
	router.POST("api/video/upload", app.auth.AuthMiddleware, app.handlers.Video.Upload)
	router.DELETE("api/video/:id", app.auth.AuthMiddleware, app.handlers.Video.Delete)
	router.GET("api/video/:id/comments", app.auth.OptionalAuthMiddleware, app.handlers.Action.Comments)
	router.POST("api/video/:id/comment", app.auth.AuthMiddleware, app.handlers.Action.AddComment)
	router.POST("api/video/:id/reaction", app.auth.AuthMiddleware, app.handlers.Action.Reaction) //query r=like||dislike
	router.GET("api/video/:id/reaction", app.auth.AuthMiddleware, app.handlers.Action.GetReaction)
	// router.POST("api/video/:id/upscale", app.handlers.Video.Upscale)                    //query real=true||false
	//default create sub for original language and english for translate sub query lang=fr||ru||...
	// router.GET("/video/:id/sub", app.handlers.Video.Subtitles)

	router.GET("api/user/:id", app.handlers.User.Get)
	router.DELETE("api/user/:id", app.auth.AuthMiddleware, app.handlers.User.Delete)
	router.GET("api/user/video/:id", app.handlers.User.GetByVideoId)
	router.POST("api/user/:id/upload", app.auth.AuthMiddleware, app.handlers.User.UploadAvatar)
	router.POST("api/user/channel/:id", app.auth.AuthMiddleware, app.handlers.Action.SubUnsubAction)         //query action=sub||unsub
	router.GET("api/channel/:id/subcount", app.auth.AuthMiddleware, app.handlers.User.GetSubscriptionsCount) //query period=30(days)
	router.GET("api/user/:id/sub", app.auth.AuthMiddleware, app.handlers.User.GetSubscriptions)
	router.GET("api/user/:id/sub/video", app.auth.AuthMiddleware, app.handlers.User.GetSubscriptionsVideo)
	router.GET("api/user/:id/watched", app.auth.AuthMiddleware, app.handlers.User.GetWatchedVideo)
	router.GET("api/user/:id/liked", app.auth.AuthMiddleware, app.handlers.User.GetLikedVideo)
	router.GET("api/user/:id/video", app.auth.AuthMiddleware, app.handlers.User.Videos)
	router.GET("api/channel/:id/views", app.auth.AuthMiddleware, app.handlers.User.GetViewsCount) //query period=30(days)
	router.GET("api/channel/:id/subscribed", app.auth.AuthMiddleware, app.handlers.User.Subscribed)
	router.POST("api/video/:id/views", app.auth.OptionalAuthMiddleware, app.handlers.User.ViewVideo)          //body deviceId
	router.GET("api/user/:id/recommendations", app.auth.AuthMiddleware, app.handlers.User.GetRecommendation) //query limit=10, offset=0

	return router
}
