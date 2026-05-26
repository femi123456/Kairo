# Kairo

Kairo is a collaborative, real-time workspace and note-taking application featuring an AI assistant designed to help you write and organize better.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Tiptap (Rich Text Editor), Socket.io-client, Sonner (Toasts)
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io, JWT Authentication
- **AI Integration**: Groq API (Llama 3.3) for the Kairo AI assistant

## Features
- **Real-time Collaboration**: Write and organize notes simultaneously with others using Socket.io and Tiptap.
- **AI Assistant**: Supercharge your writing with Groq API (Llama 3.3) integration for intelligent text generation and assistance.
- **Public Note Sharing**: Easily share your notes publicly via unique URLs.
- **Secure Authentication & Password Recovery**: JWT-based authentication with email-based password resets via Mailjet.

## Testing / Live URL
The application is deployed and ready for testing. Please test the application using the provided live URL, as local hosting instructions have been omitted for this phase.

## Deployment

### Deploying the Client (Vercel)
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Set the Framework Preset to **Vite**.
4. Set the Root Directory to `client`.
5. Add the environment variables:
   - `VITE_API_URL`: Your deployed server API URL (e.g., https://kairo-server.up.railway.app/api)
   - `VITE_SOCKET_URL`: Your deployed server URL (e.g., https://kairo-server.up.railway.app)
6. Deploy! The included `vercel.json` ensures SPA routing works correctly.

### Deploying the Server (Railway)
1. Push your repository to GitHub.
2. Create a new project in Railway and select "Deploy from repo".
3. Point it to the `server` directory (or use the monorepo root and configure the root directory in settings).
4. Add the environment variables from your `server/.env` file.
   - Set `CLIENT_URL` to your deployed Vercel URL.
5. The included `railway.toml` uses Nixpacks to automatically build (`npm run build`) and start (`npm start`) your server.
