package main

import (
	"urlcrawler/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/urls", handlers.GetAllURLs)
	r.POST("/urls", handlers.PostURL)

	r.Run(":8080")
}
