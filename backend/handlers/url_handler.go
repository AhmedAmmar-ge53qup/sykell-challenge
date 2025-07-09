package handlers

import (
	"net/http"
	"urlcrawler/crawler"
	"urlcrawler/models"
	"urlcrawler/storage"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllURLs(c *gin.Context) {
	data := storage.GetAllURLs()
	c.JSON(http.StatusOK, data)
}

func GetURLByID(c *gin.Context) {
	id := c.Param("id")
	info, found := storage.GetURLByID(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, info)
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

	// Save placeholder with status "queued"
	queuedInfo := models.URLInfo{
		ID:     id,
		URL:    payload.URL,
		Status: "queued",
	}
	storage.SaveURL(queuedInfo)

	// Crawl in background
	go func() {
		// Update status to "running" before starting analysis
		runningInfo := queuedInfo
		runningInfo.Status = "running"
		storage.UpdateURL(id, runningInfo)

		// Perform crawl
		result, err := crawler.Analyze(payload.URL)
		result.ID = id
		if err != nil {
			result.Status = "error"
		} else {
			result.Status = "done"
		}

		storage.UpdateURL(id, result)
	}()

	// Respond immediately
	c.JSON(http.StatusAccepted, queuedInfo)
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
