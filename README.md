# Kairo

Kairo is a collaborative, real-time workspace and note-taking application featuring an AI assistant designed to help you write and organize better.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Tiptap (Rich Text Editor), Socket.io-client, Sonner (Toasts)
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io, JWT Authentication
- **AI Integration**: Groq API (Llama 3.3) for the Kairo AI assistant

## Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Kairo
```

### 2. Server Setup
```bash
cd server
npm install
cp .env.example .env
```
Fill in the environment variables in `server/.env`:
- `PORT`: 8000
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secret string for signing JWT tokens
- `GROQ_API_KEY`: Your Groq API key for the AI assistant
- `CLIENT_URL`: http://localhost:5173 (for CORS)

Start the server:
```bash
npm run dev
```

### 3. Client Setup
Open a new terminal:
```bash
cd client
npm install
cp .env.example .env
```
Fill in the environment variables in `client/.env`:
- `VITE_API_URL`: http://localhost:8000/api
- `VITE_SOCKET_URL`: http://localhost:8000

Start the client:
```bash
npm run dev
```

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
