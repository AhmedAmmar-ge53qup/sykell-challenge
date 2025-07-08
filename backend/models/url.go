package models

type URLInfo struct {
	ID            string         `json:"id"`
	URL           string         `json:"url"`
	Status        string         `json:"status"`
	Title         string         `json:"title,omitempty"`
	HTMLVersion   string         `json:"html_version,omitempty"`
	Headings      map[string]int `json:"headings,omitempty"`
	InternalLinks int            `json:"internal_links"`
	ExternalLinks int            `json:"external_links"`
	BrokenLinks   []BrokenLink   `json:"broken_links"`
	HasLoginForm  bool           `json:"has_login_form"`
}

type BrokenLink struct {
	URL    string `json:"url"`
	Status int    `json:"status"`
}
