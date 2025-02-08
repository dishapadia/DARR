package middleware

import "net/http"

// CORSMiddleware applies CORS headers to all responses.
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins (for development; restrict in production)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// Allow common HTTP methods
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		// Allow required headers
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight (OPTIONS) request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}
