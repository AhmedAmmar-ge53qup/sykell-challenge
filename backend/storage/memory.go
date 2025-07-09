package storage

import (
	"sync"
	"urlcrawler/models"
)

var (
	urls = make(map[string]models.URLInfo)
	mu   sync.Mutex
)

func GetAllURLs() []models.URLInfo {
	mu.Lock()
	defer mu.Unlock()
	list := make([]models.URLInfo, 0, len(urls))
	for _, v := range urls {
		list = append(list, v)
	}
	return list
}

func GetURLByID(id string) (models.URLInfo, bool) {
	mu.Lock()
	defer mu.Unlock()
	info, ok := urls[id]
	return info, ok
}

func SaveURL(info models.URLInfo) {
	mu.Lock()
	defer mu.Unlock()
	urls[info.ID] = info
}

func DeleteURL(id string) bool {
	mu.Lock()
	defer mu.Unlock()
	if _, exists := urls[id]; exists {
		delete(urls, id)
		return true
	}
	return false
}

func UpdateURL(id string, info models.URLInfo) bool {
	mu.Lock()
	defer mu.Unlock()
	if _, exists := urls[id]; exists {
		urls[id] = info
		return true
	}
	return false
}
