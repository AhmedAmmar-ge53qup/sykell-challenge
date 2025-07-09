package handlers

import (
	"context"
	"net/http"
	"sync"
	"urlcrawler/crawler"
	"urlcrawler/models"
	"urlcrawler/storage"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var (
	jobsMu sync.Mutex
	jobs   = make(map[string]context.CancelFunc)
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

	// Create cancelable context and track cancel func
	ctx, cancel := context.WithCancel(context.Background())

	jobsMu.Lock()
	jobs[id] = cancel
	jobsMu.Unlock()

	// Crawl in background
	go func() {
		// Update status to "running"
		runningInfo := queuedInfo
		runningInfo.Status = "running"
		storage.UpdateURL(id, runningInfo)

		// Perform crawl
		result, err := crawler.Analyze(ctx, payload.URL)
		result.ID = id

		if err != nil {
			select {
			case <-ctx.Done():
				result.Status = "stopped"
			default:
				result.Status = "error"
			}
		} else {
			result.Status = "done"
		}

		storage.UpdateURL(id, result)

		// Remove job after done
		jobsMu.Lock()
		delete(jobs, id)
		jobsMu.Unlock()
	}()

	// Respond immediately
	c.JSON(http.StatusAccepted, queuedInfo)
}

func DeleteURL(c *gin.Context) {
	id := c.Param("id")

	// Stop job if running
	jobsMu.Lock()
	cancel, running := jobs[id]
	jobsMu.Unlock()

	if running {
		cancel()
		jobsMu.Lock()
		delete(jobs, id)
		jobsMu.Unlock()
	}

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

	// Cancel existing job if running
	jobsMu.Lock()
	if cancel, running := jobs[id]; running {
		cancel()
		delete(jobs, id)
	}
	jobsMu.Unlock()

	ctx, cancel := context.WithCancel(context.Background())

	jobsMu.Lock()
	jobs[id] = cancel
	jobsMu.Unlock()

	// Update status to queued initially
	info := models.URLInfo{
		ID:     id,
		URL:    existing.URL,
		Status: "queued",
	}
	storage.UpdateURL(id, info)

	go func() {
		runningInfo := info
		runningInfo.Status = "running"
		storage.UpdateURL(id, runningInfo)

		result, err := crawler.Analyze(ctx, existing.URL)
		result.ID = id

		if err != nil {
			select {
			case <-ctx.Done():
				result.Status = "stopped"
			default:
				result.Status = "error"
			}
		} else {
			result.Status = "done"
		}

		storage.UpdateURL(id, result)

		jobsMu.Lock()
		delete(jobs, id)
		jobsMu.Unlock()
	}()

	c.JSON(http.StatusOK, info)
}

// New handler: Stop processing a URL by ID
func StopURL(c *gin.Context) {
	id := c.Param("id")

	jobsMu.Lock()
	cancel, running := jobs[id]
	jobsMu.Unlock()

	if !running {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not running"})
		return
	}

	cancel()

	info, found := storage.GetURLByID(id)
	if found {
		info.Status = "stopped"
		storage.UpdateURL(id, info)
	}

	jobsMu.Lock()
	delete(jobs, id)
	jobsMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"status": "stopped"})
}
