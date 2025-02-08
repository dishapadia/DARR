package handlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    "os/exec"
    "time"
)

type PomodoroConfig struct {
    WorkDuration      int `json:"work_duration"`
    BreakDuration     int `json:"break_duration"`
    LongBreakDuration int `json:"long_break_duration"`
}

var currentState string
var workDuration, breakDuration, longBreakDuration int

func clearScreen() {
    cmd := exec.Command("clear") // Use "cls" on Windows
    cmd.Stdout = os.Stdout
    cmd.Run()
}

func countdown(minutes int, channel chan string) {
    for i := minutes * 60; i >= 0; i-- {
        minutesLeft := i / 60
        secondsLeft := i % 60
        clearScreen()
        fmt.Printf("Time left: %02d:%02d\n", minutesLeft, secondsLeft)
        time.Sleep(1 * time.Second)

        // If the countdown is finished, signal the frontend
        if i == 0 {
            channel <- "done"
        }
    }
}

func HandlePomodoro(w http.ResponseWriter, r *http.Request) {
    // Start a new Pomodoro session
    if r.Method == http.MethodPost {
        var config PomodoroConfig
        decoder := json.NewDecoder(r.Body)
        if err := decoder.Decode(&config); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }

        // Set the global variables from the received config
        workDuration = config.WorkDuration
        breakDuration = config.BreakDuration
        longBreakDuration = config.LongBreakDuration

        // Respond with the accepted configuration
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(config)

        currentState = "Pomodoro started"
    } else if r.Method == http.MethodGet {
        // Return current state or config
        w.Header().Set("Content-Type", "application/json")
        if currentState == "" {
            currentState = "No Pomodoro started"
        }
        fmt.Fprintf(w, `{"state": "%s"}`, currentState)
    }
}