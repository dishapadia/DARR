package main

import (
	"log"
	"net/http"

	"studysphere/handlers"
	"studysphere/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Create a new HTTP multiplexer (router)
	mux := http.NewServeMux()

		// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	http.HandleFunc("/getSuggestions", handlers.GetSuggestionsHandler)

	// Debugging log to verify route is registered
	log.Println("Routes registered: /getSuggestions, /classify")

	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}

	// Register the classify endpoint
	mux.HandleFunc("/classify", handlers.ClassifyHandler)
	http.HandleFunc("/getSuggestions", handlers.GetSuggestionsHandler) // new suggestions endpoint

	// Wrap all handlers with CORS middleware
	handlerWithCORS := middleware.CORSMiddleware(mux)

	// Start the server with CORS enabled
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", handlerWithCORS); err != nil {
		log.Fatal(err)
	}
}
