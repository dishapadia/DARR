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

	// Register endpoints on the custom mux
	mux.HandleFunc("/classify", handlers.ClassifyHandler)
	mux.HandleFunc("/getSuggestions", handlers.GetSuggestionsHandler)

	// Wrap all handlers with CORS middleware
	handlerWithCORS := middleware.CORSMiddleware(mux)

	// Debugging log to verify routes are registered
	log.Println("Routes registered: /classify, /getSuggestions")

	// Start the server with CORS enabled
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", handlerWithCORS); err != nil {
		log.Fatal(err)
	}
}
