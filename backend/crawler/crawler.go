package crawler

import (
	"context"
	"net/http"
	"net/url"
	"strings"
	"urlcrawler/models"

	"github.com/PuerkitoBio/goquery"
)

func Analyze(ctx context.Context, rawURL string) (models.URLInfo, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", rawURL, nil)
	if err != nil {
		return models.URLInfo{URL: rawURL, Status: "error"}, err
	}

	resp, err := http.DefaultClient.Do(req)
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

	// Count headings h1..h6
	for i := 1; i <= 6; i++ {
		tag := "h" + string(rune('0'+i))
		info.Headings[strings.ToUpper(tag)] = doc.Find(tag).Length()
	}

	// Check links with cancellation support
	doc.Find("a[href]").EachWithBreak(func(i int, s *goquery.Selection) bool {
		select {
		case <-ctx.Done():
			// stop iteration if canceled
			return false
		default:
		}

		href, exists := s.Attr("href")
		if !exists || href == "" || strings.HasPrefix(href, "#") {
			return true
		}

		absolute := resolveLink(rawURL, href)
		if isInternalLink(rawURL, absolute) {
			info.InternalLinks++
		} else {
			info.ExternalLinks++
		}

		code := checkLinkWithContext(ctx, absolute)
		if code >= 400 {
			info.BrokenLinks = append(info.BrokenLinks, models.BrokenLink{
				URL:    absolute,
				Status: code,
			})
		} else {
			info.AccessibleLinks++
		}

		return true
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

// context-aware link checker
func checkLinkWithContext(ctx context.Context, link string) int {
	req, err := http.NewRequestWithContext(ctx, "HEAD", link, nil)
	if err != nil {
		return 500
	}

	resp, err := http.DefaultClient.Do(req)
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
