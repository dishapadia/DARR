package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

// SuggestionResponse defines the JSON structure for the suggestions endpoint response.
type SuggestionResponse struct {
	Suggestions string `json:"suggestions"`
}

// GetSuggestionsHandler computes a user score (or uses stored distraction data),
// builds a prompt, and calls the Groq API to generate suggestions.
func GetSuggestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// For demonstration, we'll use dummy distraction data.
	// In production, retrieve actual distraction data for the user.
	distractionData := map[string]int{
		"youtube.com": 120, // seconds spent
		"facebook.com": 90,
	}
	totalDistractionTime := 0
	for _, t := range distractionData {
		totalDistractionTime += t
	}

	totalStudyTime := 3600 // example study time in seconds
	distractionPercentage := float64(totalDistractionTime) / float64(totalStudyTime) * 100
	userScore := 100 - int(distractionPercentage)
	if userScore < 0 {
		userScore = 0
	}

	// Build a prompt for the Groq API.
	prompt := fmt.Sprintf(
		"The user's distraction score is %d out of 100. They spent the following time on distracting websites: %v (in seconds). Provide friendly, practical suggestions to improve focus and study habits.",
		userScore, distractionData,
	)

	// Call Groq's API to generate suggestions.
	suggestions, err := callGroqSuggestions(prompt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := SuggestionResponse{Suggestions: suggestions}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// callGroqSuggestions calls the Groq API to generate suggestions based on a prompt.
// Note: Adjust the endpoint URL, request payload, and response parsing based on Groq's documentation.
func callGroqSuggestions(prompt string) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GROQ_API_KEY is not set")
	}

	// Build the request payload for Groq's API.
	// The payload structure is assumed for demonstration.
	requestBody, err := json.Marshal(map[string]interface{}{
		"model":      "llama-3.3-70b-versatile", // Replace with the actual model identifier if needed.
		"messages": []map[string]string{
			{"role": "system", "content": "You are a helpful study assistant."},
			{"role": "user", "content": prompt}, // ✅ Corrected field
		},
		"max_tokens": 150,
		"temperature": 0.7, // ✅ Optional: Adjust creativity level
	})
	if err != nil {
		return "", err
	}

	// Replace the URL below with the actual Groq API endpoint.
	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	// Send the request.
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Check for a successful response.
	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return "", fmt.Errorf("Groq API error: %s", string(body))
	}

	// Parse the response.
	// Adjust the response structure based on Groq's API.
	var result struct {
		Output string `json:"output"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return "Try breaking study sessions into Pomodoro intervals and reducing distractions.", nil
	
}
