package main

import (
	"log"
	"net/http"
	"studysphere/handlers"
	"studysphere/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Create a new HTTP multiplexer (router)
	mux := http.NewServeMux()

	// Register handlers **before** starting the server
	mux.HandleFunc("/studyplan", handlers.StudyPlanHandler)
	mux.HandleFunc("/classify", handlers.ClassifyHandler)
	mux.HandleFunc("/getSuggestions", handlers.GetSuggestionsHandler)
	mux.HandleFunc("/pomodoro", handlers.HandlePomodoro)

	// Wrap handlers with CORS middleware
	handlerWithCORS := middleware.CORSMiddleware(mux)

	// Start the server
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", handlerWithCORS); err != nil {
		log.Fatal(err)
	}
}
