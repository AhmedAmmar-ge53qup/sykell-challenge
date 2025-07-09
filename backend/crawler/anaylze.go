package crawler

import (
	"net/http"
	"net/url"
	"strings"

	"urlcrawler/models"

	"github.com/PuerkitoBio/goquery"
)

func Analyze(rawURL string) (models.URLInfo, error) {
	resp, err := http.Get(rawURL)
	if err != nil {
		return models.URLInfo{URL: rawURL, Status: "error"}, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return models.URLInfo{URL: rawURL, Status: "error"}, err
	}

	info := models.URLInfo{
		URL:         rawURL,
		Status:      "done",
		Headings:    map[string]int{},
		BrokenLinks: []models.BrokenLink{},
	}

	info.HTMLVersion = detectHTMLVersion(resp)
	info.Title = doc.Find("title").Text()

	for i := 1; i <= 6; i++ {
		tag := "h" + string(rune('0'+i))
		info.Headings[strings.ToUpper(tag)] = doc.Find(tag).Length()
	}

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		if strings.HasPrefix(href, "#") || href == "" {
			return
		}

		absolute := resolveLink(rawURL, href)
		if isInternalLink(rawURL, absolute) {
			info.InternalLinks++
		} else {
			info.ExternalLinks++
		}

		code := checkLink(absolute)
		if code >= 400 {
			info.BrokenLinks = append(info.BrokenLinks, models.BrokenLink{
				URL:    absolute,
				Status: code,
			})
		}
	})

	info.HasLoginForm = doc.Find(`form input[type="password"]`).Length() > 0

	return info, nil
}

/* ====== Supporting functions ====== */

func resolveLink(baseURL, href string) string {
	u, err := url.Parse(href)
	if err != nil {
		return href
	}
	base, err := url.Parse(baseURL)
	if err != nil {
		return href
	}
	return base.ResolveReference(u).String()
}

func isInternalLink(baseURL, link string) bool {
	base, err := url.Parse(baseURL)
	dest, err2 := url.Parse(link)
	if err != nil || err2 != nil {
		return false
	}
	return base.Hostname() == dest.Hostname()
}

func checkLink(link string) int {
	resp, err := http.Head(link)
	if err != nil {
		return 500
	}
	defer resp.Body.Close()
	return resp.StatusCode
}

func detectHTMLVersion(resp *http.Response) string {
	if resp.ProtoMajor == 1 {
		if resp.ProtoMinor == 0 {
			return "HTML 4.01"
		}
		return "XHTML or HTML 4.01"
	}
	if resp.ProtoMajor == 2 {
		return "HTML5"
	}
	return "Unknown"
}
