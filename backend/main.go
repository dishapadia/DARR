package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/sashabaranov/go-openai"
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

// generateStudyPlan generates a personalized study plan using OpenAI API.
func generateStudyPlan(userInput UserInput) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("missing OpenAI API key. Set OPENAI_API_KEY environment variable")
	}

	client := openai.NewClient(apiKey)

	// Format user input into a prompt
	subjects := strings.Join(userInput.Subjects, ", ")
	prompt := fmt.Sprintf(
		"Create a personalized study plan for the following subjects: %s. The user has %d hours per day to study and prefers to study in the %s. Allocate study time accordingly, with breaks included.",
		subjects, userInput.StudyTimePerDay, userInput.Preferences.StudyTime,
	)

	// Call OpenAI API to generate the study plan
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo, // Use "gpt-3.5-turbo" if you don’t have access to GPT-4
			Messages: []openai.ChatCompletionMessage{
				{Role: "system", Content: "You are an AI assistant that creates structured study plans."},
				{Role: "user", Content: prompt},
			},
			MaxTokens: 500,
		},
	)

	if err != nil {
		return "", err
	}

	return resp.Choices[0].Message.Content, nil
}

// studyPlanHandler processes the request and sends the generated study plan to the frontend.
func studyPlanHandler(w http.ResponseWriter, r *http.Request) {
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

	// Generate study plan using OpenAI
	studyPlanText, err := generateStudyPlan(userInput)
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

func main() {
	http.HandleFunc("/generateStudyPlan", studyPlanHandler)
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
