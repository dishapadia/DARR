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
		"The user's distraction score is %d out of 100. They spent time on the following websites: %v. Generate three concise study tips. Each tip should be a short sentence and be numbered 1, 2, and 3.",
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

	requestBody, err := json.Marshal(map[string]interface{}{
		"model": "llama-3.3-70b-versatile", // Model from Groq documentation
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	})
	if err != nil {
		return "", err
	}

	// groq endpoint URL
	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Read the raw response body from Groq
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// 🔍 Debugging: Print the raw response from Groq
	fmt.Println("Raw Groq API Response:", string(body))

	// Parse response based on expected format
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("JSON parse error: %v\nRaw response: %s", err, string(body))
	}

	// Return AI-generated suggestion if available, otherwise provide a fallback response
	if len(result.Choices) > 0 {
		return result.Choices[0].Message.Content, nil
	}

	return "Try breaking study sessions into Pomodoro intervals and reducing distractions.", nil
}

