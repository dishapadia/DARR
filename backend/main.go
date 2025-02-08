package main

import (
	"log"
	"net/http"

	"studysphere/handlers"
	"studysphere/middleware"
)

func main() {
	// Create a new HTTP multiplexer (router)
	mux := http.NewServeMux()

	// Register the classify endpoint
	mux.HandleFunc("/classify", handlers.ClassifyHandler)

	// Wrap all handlers with CORS middleware
	handlerWithCORS := middleware.CORSMiddleware(mux)

	// Start the server with CORS enabled
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", handlerWithCORS); err != nil {
		log.Fatal(err)
	}
}
