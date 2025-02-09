package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

// InputData defines the expected JSON payload.
// Adjust the fields if you expect additional or different data.
type InputData struct {
	StudyTimePerDay int      `json:"study_time_per_day"`
	Tasks           []string `json:"tasks"`
	// Add more fields if needed, e.g., DistractionSites, Preferences, etc.
}

// PrintInputsHandler receives the JSON payload, prints it, and returns a response.
func PrintInputsHandler(w http.ResponseWriter, r *http.Request) {
	// Allow only POST requests.
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode the incoming JSON payload into an InputData struct.
	var input InputData
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid JSON input", http.StatusBadRequest)
		return
	}

	// Print the received inputs to the server logs.
	log.Printf("Received input: StudyTimePerDay: %d, Tasks: %v", input.StudyTimePerDay, input.Tasks)

	// Optionally, you can perform additional processing or validation here.

	// Prepare a response indicating success.
	response := map[string]interface{}{
		"status":  "success",
		"message": "Inputs received and printed",
		"data":    input,
	}

	// Set the Content-Type header and encode the response as JSON.
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
