# MediSpeakAI

MediSpeakAI is an AI-powered medical chatbot that enables users to interact using voice. It leverages Google Gemini for generating clinically accurate, empathetic responses and Google TTS for natural speech playback.

## Features

- **Google OAuth authentication**
- **Speech-to-text** input (browser mic)
- **AI-generated medical advice** (Gemini API)
- **Text-to-speech** AI responses (Google TTS)
- **Chat history** with audio playback
- **Modern, responsive UI**

> **Note:** This project is for educational purposes and not a substitute for professional medical advice.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud credentials for OAuth and Gemini API

### Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Hitesh-Reddy-09/MediSpeakAI.git
   cd MediSpeakAI
   ```

2. **Backend setup:**

   - Go to the `backend` folder:
     ```sh
     cd backend
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Create a `.env` file in `backend/` with the following:
     ```env
     GEMINI_API_KEY=your_gemini_api_key
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     MONGO_URI=your_mongodb_connection_string
     SESSION_SECRET=your_session_secret
     ```
   - Start the backend server:
     ```sh
     npm run dev
     # or
     npm start
     ```

3. **Frontend setup:**
   - Open a new terminal and go to the `frontend` folder:
     ```sh
     cd ../frontend
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Start the frontend:
     ```sh
     npm start
     ```
   - The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
backend/    # Node.js/Express backend (API, auth, AI, TTS)
frontend/   # React frontend (UI, chat, auth)
```

## License

This project is licensed for educational and demonstration purposes only.

---

## Disclaimer

MediSpeakAI is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
