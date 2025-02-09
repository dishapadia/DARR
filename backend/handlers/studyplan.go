package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

// UserInput holds the data that the user provides.
type UserInput struct {
	StudyTimePerDay int      `json:"study_time_per_day"` // Total study time per day in hours
	Tasks           []string `json:"tasks"`              // List of tasks to complete
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

	// Format tasks into a string
	tasks := strings.Join(userInput.Tasks, ", ")
	numTasks := len(userInput.Tasks)

	// Calculate how much time should be allocated to each task
	if numTasks == 0 {
		return "", fmt.Errorf("no tasks provided")
	}

	// Time per task (in hours), based on study time per day and number of tasks
	timePerTask := userInput.StudyTimePerDay / numTasks

	// Format the prompt with study time per task
	prompt := fmt.Sprintf(
		"Create a personalized study plan for the following tasks: %s. The user has %d hours per day to study. " +
			"Allocate %d hours per task accordingly to ensure all tasks are completed.",
		tasks, userInput.StudyTimePerDay, timePerTask,
	)

	// Debugging: Log the prompt being sent to the API
	log.Println("Sending prompt to API:", prompt)

	// Corrected API request body format
	requestBody := map[string]interface{}{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]string{
			{"role": "system", "content": "You are a helpful AI tutor that creates study plans."},
			{"role": "user", "content": prompt},
		},
		"max_tokens": 500,
	}

	// Convert to JSON
	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %v", err)
	}

	// Make API request
	url := "https://api.groq.com/openai/v1/chat/completions"
	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, url, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Debugging: Print API Response
	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Println("Groq API Response:", string(bodyBytes))

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to generate study plan, status code: %d", resp.StatusCode)
	}

	// Decode response
	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	err = json.Unmarshal(bodyBytes, &response)
	if err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	// Return generated study plan
	return response.Choices[0].Message.Content, nil
}

// studyPlanHandler processes the request and sends the generated study plan to the frontend.
func StudyPlanHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("📢 StudyPlanHandler hit!") // Add this to check if it's being called
	
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