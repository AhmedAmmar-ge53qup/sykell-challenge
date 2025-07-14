package storage

import (
	"database/sql"
	"encoding/json"
	"log"
	"urlcrawler/models"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func InitDB() {
	var err error
	db, err = sql.Open("sqlite", "./urls.db")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS urls (
		id TEXT PRIMARY KEY,
		url TEXT,
		status TEXT,
		title TEXT,
		html_version TEXT,
		headings TEXT,
		internal_links INTEGER,
		external_links INTEGER,
		accessible_links INTEGER,
		broken_links TEXT,
		has_login_form BOOLEAN
	);`

	if _, err := db.Exec(createTable); err != nil {
		log.Fatal("Failed to create table:", err)
	}
}

func GetAllURLs() []models.URLInfo {
	rows, err := db.Query("SELECT * FROM urls")
	if err != nil {
		log.Println("GetAllURLs query failed:", err)
		return nil
	}
	defer rows.Close()

	var urls []models.URLInfo
	for rows.Next() {
		var u models.URLInfo
		var headingsJSON, brokenLinksJSON string

		err := rows.Scan(
			&u.ID, &u.URL, &u.Status, &u.Title, &u.HTMLVersion,
			&headingsJSON, &u.InternalLinks, &u.ExternalLinks,
			&u.AccessibleLinks, &brokenLinksJSON, &u.HasLoginForm,
		)
		if err != nil {
			log.Println("Scan failed:", err)
			continue
		}

		json.Unmarshal([]byte(headingsJSON), &u.Headings)
		json.Unmarshal([]byte(brokenLinksJSON), &u.BrokenLinks)

		urls = append(urls, u)
	}
	return urls
}

func GetURLByID(id string) (models.URLInfo, bool) {
	var u models.URLInfo
	var headingsJSON, brokenLinksJSON string

	err := db.QueryRow("SELECT * FROM urls WHERE id = ?", id).Scan(
		&u.ID, &u.URL, &u.Status, &u.Title, &u.HTMLVersion,
		&headingsJSON, &u.InternalLinks, &u.ExternalLinks,
		&u.AccessibleLinks, &brokenLinksJSON, &u.HasLoginForm,
	)
	if err != nil {
		return u, false
	}

	json.Unmarshal([]byte(headingsJSON), &u.Headings)
	json.Unmarshal([]byte(brokenLinksJSON), &u.BrokenLinks)

	return u, true
}

func SaveURL(info models.URLInfo) {
	headingsJSON, _ := json.Marshal(info.Headings)
	brokenLinksJSON, _ := json.Marshal(info.BrokenLinks)

	_, err := db.Exec(`
		INSERT OR REPLACE INTO urls (
			id, url, status, title, html_version,
			headings, internal_links, external_links,
			accessible_links, broken_links, has_login_form
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		info.ID, info.URL, info.Status, info.Title, info.HTMLVersion,
		string(headingsJSON), info.InternalLinks, info.ExternalLinks,
		info.AccessibleLinks, string(brokenLinksJSON), info.HasLoginForm,
	)
	if err != nil {
		log.Println("SaveURL failed:", err)
	}
}

func DeleteURL(id string) bool {
	res, err := db.Exec("DELETE FROM urls WHERE id = ?", id)
	if err != nil {
		log.Println("DeleteURL failed:", err)
		return false
	}
	count, _ := res.RowsAffected()
	return count > 0
}

func UpdateURL(id string, info models.URLInfo) bool {
	headingsJSON, _ := json.Marshal(info.Headings)
	brokenLinksJSON, _ := json.Marshal(info.BrokenLinks)

	_, err := db.Exec(`
		UPDATE urls SET
			url = ?, status = ?, title = ?, html_version = ?,
			headings = ?, internal_links = ?, external_links = ?,
			accessible_links = ?, broken_links = ?, has_login_form = ?
		WHERE id = ?`,
		info.URL, info.Status, info.Title, info.HTMLVersion,
		string(headingsJSON), info.InternalLinks, info.ExternalLinks,
		info.AccessibleLinks, string(brokenLinksJSON), info.HasLoginForm,
		id,
	)
	if err != nil {
		log.Println("UpdateURL failed:", err)
		return false
	}
	return true
}
