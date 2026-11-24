package routes

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
	"github.com/jobhunter-ai/api-gateway/internal/handlers"
	"github.com/jobhunter-ai/api-gateway/internal/middleware"
)

func Setup(router *gin.Engine, cfg *config.Config) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "api-gateway",
			"version": cfg.AppVersion,
			"time":    time.Now().UTC().Format(time.RFC3339),
		})
	})

	api := router.Group("/api/v1")
	{
		auth := handlers.NewAuthHandler(cfg)
		api.POST("/auth/register", auth.Register)
		api.POST("/auth/login", auth.Login)
		api.POST("/auth/refresh", auth.RefreshToken)

		protected := api.Group("")
		protected.Use(middleware.JWTAuth(cfg))
		{
			user := handlers.NewUserHandler(cfg)
			protected.GET("/users/me", user.GetProfile)
			protected.PUT("/users/me", user.UpdateProfile)

			job := handlers.NewJobHandler(cfg)
			protected.POST("/jobs", job.Search)
			protected.GET("/jobs/:id", job.GetByID)
			protected.POST("/jobs/scrape", job.TriggerScrape)

			profile := handlers.NewProfileHandler(cfg)
			protected.POST("/profile/parse-linkedin", profile.ParseLinkedIn)
			protected.GET("/profile/github/:username", profile.GetGitHub)

			cv := handlers.NewCVHandler(cfg)
			protected.GET("/cv/quiz", cv.Quiz)
			protected.POST("/cv/generate", cv.Generate)
			protected.GET("/cv/versions", cv.ListVersions)
			protected.GET("/cv/versions/:id", cv.GetVersion)

			ats := handlers.NewATSHandler(cfg)
			protected.POST("/ats/analyze", ats.Analyze)

			app := handlers.NewApplicationHandler(cfg)
			protected.GET("/applications", app.List)
			protected.POST("/applications", app.Create)
			protected.PUT("/applications/:id/status", app.UpdateStatus)
		}
	}
}