package services

import (
	"errors"
	"net/url"
	"strings"
)

// distractingDomains is a list of known distracting domains.
// You can expand or modify this list based on your requirements.
var distractingDomains = []string{
	"netflix.com",
	"youtube.com",
	"reddit.com",
	"facebook.com",
	"twitter.com",
	"instagram.com",
	"tiktok.com",
	// Add more distracting domains as needed.
}

// ClassifyWebsite analyzes the provided website URL and determines if it's "helpful" or "distracting".
// This is a simple heuristic that checks if the domain is in the distractingDomains list.
// In a future version, this function could integrate with an AI service for more advanced analysis.
func ClassifyWebsite(websiteURL string) (string, error) {
	// Parse the provided URL to extract components such as the hostname.
	parsedURL, err := url.Parse(websiteURL)
	if err != nil {
		return "", err
	}

	// Extract the hostname (domain) from the parsed URL.
	domain := parsedURL.Hostname()
	if domain == "" {
		return "", errors.New("invalid domain")
	}

	// Check if the extracted domain contains any substring from the distractingDomains list.
	for _, d := range distractingDomains {
		if strings.Contains(domain, d) {
			// If a match is found, classify the website as "distracting".
			return "distracting", nil
		}
	}

	// If no match is found, classify the website as "helpful".
	return "helpful", nil
}
