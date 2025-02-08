package main

import (
	"log"
	"net/http"

	"studybuddy/handlers"
)

func main() {
	// Register the /classify endpoint and map it to the ClassifyHandler function.
	http.HandleFunc("/classify", handlers.ClassifyHandler)

	// Log that the server is starting on port 8080.
	log.Println("Server starting on port 8080")

	// Start the HTTP server on port 8080. If an error occurs, log it and exit.
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
