package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"studysphere/services"
)

// ClassificationRequest defines the JSON payload expected in the POST request.
// It contains the URL to classify.
type ClassificationRequest struct {
	URL string `json:"url"`
}

// ClassificationResponse defines the structure of the JSON response sent back to the client.
// It includes the original URL and its classification result.
type ClassificationResponse struct {
	URL            string `json:"url"`
	Classification string `json:"classification"`
}

// ClassifyHandler handles incoming HTTP POST requests to the /classify endpoint.
func ClassifyHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers to allow Chrome extension requests.
	w.Header().Set("Access-Control-Allow-Origin", "*") // Allows requests from any origin.
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	// Ensure that the request method is POST.
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read the entire request body.
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Always close the request body when done.
	defer r.Body.Close()

	// Parse the JSON payload into a ClassificationRequest struct.
	var req ClassificationRequest
	err = json.Unmarshal(body, &req)
	if err != nil || req.URL == "" {
		http.Error(w, "Invalid JSON or missing URL", http.StatusBadRequest)
		return
	}

	// Use the service layer to classify the provided URL.
	classification, err := services.ClassifyWebsite(req.URL)
	if err != nil {
		http.Error(w, "Error classifying website", http.StatusInternalServerError)
		return
	}

	// Prepare the JSON response with the classification result.
	res := ClassificationResponse{
		URL:            req.URL,
		Classification: classification,
	}
	// Set the response header to indicate JSON content.
	w.Header().Set("Content-Type", "application/json")
	// Encode and send the response as JSON.
	json.NewEncoder(w).Encode(res)
}
