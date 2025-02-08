package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

// UserInput holds the data that the user provides.
type UserInput struct {
	StudyTimePerDay int      `json:"study_time_per_day"`
	Subjects        []string `json:"subjects"`
	Preferences     struct {
		StudyTime string `json:"study_time"`
	} `json:"preferences"`
}

// StudyPlan holds the response that will be returned to the user.
type StudyPlan struct {
	Plan string `json:"plan"`
}

// generateStudyPlan generates a personalized study plan using GROQ API.
func createStudyPlan(userInput UserInput) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("missing GROQ API key. Set GROQ_API_KEY environment variable")
	}

	// Format user input into a prompt
	subjects := strings.Join(userInput.Subjects, ", ")
	prompt := fmt.Sprintf(
		"Create a personalized study plan for the following subjects: %s. The user has %d hours per day to study and prefers to study in the %s. Allocate study time accordingly, with breaks included.",
		subjects, userInput.StudyTimePerDay, userInput.Preferences.StudyTime,
	)

	// Create the request body
	requestBody := map[string]interface{}{
		"prompt":   prompt,
		"max_tokens": 500,
	}

	// Convert the request body to JSON
	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %v", err)
	}

	// Create an HTTP request
	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, "https://api.groq.com/openai/v1/generate", bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Check if the response is successful
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to generate study plan, status code: %d", resp.StatusCode)
	}

	// Decode the response body
	var response struct {
		Choices []struct {
			Text string `json:"text"`
		} `json:"choices"`
	}
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	// Return the generated study plan
	return response.Choices[0].Text, nil
}

// studyPlanHandler processes the request and sends the generated study plan to the frontend.
func StudyPlanHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var userInput UserInput
	err := json.NewDecoder(r.Body).Decode(&userInput)
	if err != nil {
		http.Error(w, "Invalid JSON input", http.StatusBadRequest)
		return
	}

	// Generate study plan using GROQ
	studyPlanText, err := createStudyPlan(userInput)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	studyPlan := StudyPlan{
		Plan: studyPlanText,
	}

	// Return the generated study plan as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(studyPlan)
}