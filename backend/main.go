package main

import (
	"time"
	"urlcrawler/handlers"
	"urlcrawler/storage"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// In production code, this key must be stored very differently.
const apiSecret = "verySecretCode"

func ApiSecretMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		secret := c.GetHeader("X-API-SECRET")
		if secret != apiSecret {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			return
		}
		c.Next()
	}
}

func main() {
	storage.InitDB()

	r := gin.Default()

	// Custom CORS config to allow X-API-SECRET header
	corsConfig := cors.Config{
		AllowAllOrigins: true, // Must be changed later when frontend has a fixed domain
		//AllowOrigins:     []string{"http://localhost:5173"}, // frontend origin
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "X-API-SECRET"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))

	r.GET("/urls", ApiSecretMiddleware(), handlers.GetAllURLs)
	r.GET("/urls/:id", ApiSecretMiddleware(), handlers.GetURLByID)
	r.POST("/urls", ApiSecretMiddleware(), handlers.PostURL)
	r.DELETE("/urls/:id", ApiSecretMiddleware(), handlers.DeleteURL)
	r.POST("/urls/:id/reanalyze", ApiSecretMiddleware(), handlers.ReanalyzeURL)
	r.POST("/urls/:id/stop", ApiSecretMiddleware(), handlers.StopURL)

	r.Run(":8080")
}
