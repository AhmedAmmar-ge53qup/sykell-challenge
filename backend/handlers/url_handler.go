package handlers

import (
	"net/http"
	"urlcrawler/crawler"
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
	info, err := crawler.Analyze(payload.URL)
	info.ID = id
	if err != nil {
		info.Status = "error"
	}

	storage.SaveURL(info)
	c.JSON(http.StatusCreated, info)
}

func DeleteURL(c *gin.Context) {
	id := c.Param("id")
	success := storage.DeleteURL(id)
	if success {
		c.Status(http.StatusNoContent)
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
	}
}

func ReanalyzeURL(c *gin.Context) {
	id := c.Param("id")
	existing, found := storage.GetURLByID(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	info, err := crawler.Analyze(existing.URL)
	info.ID = id
	if err != nil {
		info.Status = "error"
	}

	storage.UpdateURL(id, info)
	c.JSON(http.StatusOK, info)
}
