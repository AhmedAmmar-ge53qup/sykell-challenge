package main

import (
	"urlcrawler/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Allow all origins for now.
	r.Use(cors.Default())

	r.GET("/urls", handlers.GetAllURLs)
	r.GET("/urls/:id", handlers.GetURLByID)
	r.POST("/urls", handlers.PostURL)
	r.DELETE("/urls/:id", handlers.DeleteURL)
	r.POST("/urls/:id/reanalyze", handlers.ReanalyzeURL)
	r.POST("/urls/:id/stop", handlers.StopURL)

	r.Run(":8080")
}
