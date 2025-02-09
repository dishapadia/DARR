# StudySphere - DSRR

## Inspiration
StudySphere was created to help students **stay focused and productive** while studying. We recognized that distractions—like social media, entertainment sites, and unstructured study sessions—reduce efficiency. By integrating **AI-powered analysis**, **Pomodoro timing**, and **distraction tracking**, StudySphere provides a structured study experience with **personalized recommendations** to improve habits.

##  What It Does
StudySphere is a **Google Chrome extension** that helps students:
- **Track Time on Distracting Websites**
- **Use a Pomodoro Timer** for Structured Study Sessions
- **Block Distracting Websites**
- **Receive AI-Generated Study Tips**
- **Analyze Their Study Sessions**
- **Automatically Resume Sessions** When the Extension is Reopened

## How We Built It
### **Tech Stack**
- **Frontend:** HTML, CSS, JavaScript (Popup UI, Study Guide, Analytics Page)
- **Backend:** Go (Handles AI suggestions, classification, and session tracking)
- **AI Integration:** Groq API (for AI-generated study recommendations)
- **Storage:** Chrome Storage API & LocalStorage (Session and Settings Management)
- **Messaging:** Chrome Runtime API (Background and Popup Communication)

### **Main Features and Code Breakdown**
- **Pomodoro Timer** (`pomodoro.js`)
  - Tracks study and break times, automatically transitioning between them.
  - Saves progress, so the timer resumes even if the extension is closed.

- **Distraction Tracking** (`background.js`)
  - Monitors websites visited and logs time spent on distracting sites.
  - Sends alerts when distraction thresholds are exceeded.

- **AI-Powered Study Tips** (`suggestions.go`)
  - Uses the Groq API to generate short, personalized study tips.
  - Analyzes time spent on distractions and suggests improvements.

- **Session Persistence** (`popup.js` & `analytics.js`)
  - Saves and restores user input fields across sessions.
  - Ensures the last opened page reopens when the extension is clicked again.

## Challenges We Ran Into
- **Persisting Timer State**: Since Chrome extension popups close when clicked out, we needed to store timer state in the background service worker and sync it when the popup reopens.
- **Cross-Origin API Requests (CORS Issues)**: Connecting the frontend to the Go backend required setting up proper CORS handling.
- **AI Formatting Issues**: Initial AI responses were too verbose, requiring prompt engineering to make them concise.

## Accomplishments That We're Proud Of
- Successfully integrated **AI-generated study recommendations** based on real distraction data.
- Built a **Pomodoro timer** that remains active even when the extension popup is closed.
- Created a **seamless study session experience** by allowing users to enter tasks, set a timer, and analyze distractions all in one extension.

## What We Learned
- How to **develop a Chrome extension** with persistent background scripts.
- How to **integrate AI services** (Groq API) into a web-based application.
- Best practices for **handling state across sessions** in a browser environment.
- How to **structure a Go backend** for API handling and AI request processing.

## What's Next for StudySphere
- **More AI Customization**: Allow users to specify study goals and get more personalized recommendations.
- **Live Progress Dashboard**: A dashboard that visualizes study habits over time.
- **Enhanced Website Blocking**: Option to enforce distraction blocking rather than just tracking time spent.
- **Multi-Session Analytics**: Long-term tracking to see improvement trends in focus scores.

## Getting Started
### **Installation**
1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/DSRR.git
   ```
2. Load the Chrome extension:
   - Open **Chrome** and go to `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load Unpacked** and select the `studysphere` directory.
3. Run the backend:
   ```bash
   go run main.go
   ```
4. Click on the extension in the toolbar and start your session!

### **Environment Variables (.env)**
Create a `.env` file in the root directory and add:
```
GROQ_API_KEY=your-api-key-here
```

## Usage
- Open the extension popup and enter your **study tasks** and **distracting websites**.
- Click **Start Pomodoro** to begin a focused study session.
- View **distraction alerts** if you spend too much time on blocked websites.
- At the end of your session, check the **analytics page** for insights and AI study tips!

