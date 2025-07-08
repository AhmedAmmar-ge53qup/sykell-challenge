package handlers

import (
	"net/http"
	"urlcrawler/models"
	"urlcrawler/storage"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllURLs(c *gin.Context) {
	data := storage.GetAllURLs()
	c.JSON(http.StatusOK, data)
}

func PostURL(c *gin.Context) {
	var payload struct {
		URL string `json:"url"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil || payload.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}
	id := uuid.New().String()
	info := models.URLInfo{
		ID:     id,
		URL:    payload.URL,
		Status: "queued",
	}
	storage.SaveURL(info)
	c.JSON(http.StatusCreated, info)
}
