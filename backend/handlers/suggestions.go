package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

// DistractionData represents the structure of incoming distraction data from the frontend.
type DistractionData struct {
	Websites  map[string]int `json:"websites"`   // website: seconds spent
	StudyTime int            `json:"study_time"` // total study time in seconds
}

// SuggestionResponse defines the JSON structure for the suggestions endpoint response.
type SuggestionResponse struct {
	Suggestions string `json:"suggestions"`
}

// GetSuggestionsHandler processes distraction data from the frontend and calls the AI for suggestions.
func GetSuggestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		log.Println("what is goign here")
		return
	}

	// Parse JSON body from frontend
	var data DistractionData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid JSON input", http.StatusBadRequest)
		log.Println("what is goign here 2")
		return
	}

	// Compute distraction percentage
	totalDistractionTime := 0
	for _, t := range data.Websites {
		totalDistractionTime += t
	}

	distractionPercentage := float64(totalDistractionTime) / float64(data.StudyTime) * 100
	userScore := 100 - int(distractionPercentage)
	if userScore < 0 {
		userScore = 0
	}

	// Format websites data into a readable string
	var websiteDetails []string
	for site, timeSpent := range data.Websites {
		websiteDetails = append(websiteDetails, fmt.Sprintf("%s: %d seconds", site, timeSpent))
	}

	formattedWebsites := strings.Join(websiteDetails, ", ")
	fmt.Println("Formatted websites:", formattedWebsites)

	// Generate prompt for AI
	prompt := fmt.Sprintf(
		"The user's focus score is %d out of 100 (lower scores mean they were more distracted). "+
			"They spent time on the following websites: %s. These websites represent their main distractions during the session. "+
			"Provide study tips based on the user's tendency to visit these websites. Praise them for good scores but generate "+
			"three short study tips for those with a lower score, helping them avoid distractions like these. Each tip should be "+
			"concise and numbered 1, 2, and 3.",
		userScore, formattedWebsites,
	)

	// Call Groq API for suggestions
	suggestions, err := callGroqSuggestions(prompt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("what is goign here 3")
		return
	}

	response := SuggestionResponse{Suggestions: suggestions}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// callGroqSuggestions calls the Groq API to generate suggestions based on a prompt.
func callGroqSuggestions(prompt string) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GROQ_API_KEY is not set")
	}

	requestBody, err := json.Marshal(map[string]interface{}{
		"model": "llama-3.3-70b-versatile", // Model from Groq documentation
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	})
	if err != nil {
		log.Println("what is goign here 4")
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		log.Println("what is goign here 5")
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("what is goign here 6")
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("what is goign here 7")
		return "", err
	}

	// Debugging: Print the raw response from Groq
	fmt.Println("Raw Groq API Response:", string(body))

	// Parse response
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Println("what is goign here 8")
		return "", fmt.Errorf("JSON parse error: %v\nRaw response: %s", err, string(body))
	}
	log.Println("TEST", result.Choices[0].Message.Content)

	// Return AI-generated suggestion if available, otherwise provide a fallback response
	if len(result.Choices) > 0 {
		return result.Choices[0].Message.Content, nil
	}

	return "Try breaking study sessions into Pomodoro intervals and reducing distractions.", nil
}
