package storage

import (
	"sync"
	"urlcrawler/models"
)

var (
	urls = make(map[string]models.URLInfo)
	mu   sync.Mutex
)

func SaveURL(info models.URLInfo) {
	mu.Lock()
	defer mu.Unlock()
	urls[info.ID] = info
}

func GetAllURLs() []models.URLInfo {
	mu.Lock()
	defer mu.Unlock()
	list := make([]models.URLInfo, 0, len(urls))
	for _, v := range urls {
		list = append(list, v)
	}
	return list
}
