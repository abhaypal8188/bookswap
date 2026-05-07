# BookSwap: MERN Deployment Guide

This project is separated into a `client` (React/Vite) and `server` (Node/Express). Here is how to deploy both parts to Vercel.

## 1. Deploying the Backend (Server)

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. **Important**: In the "Framework Preset" dropdown, leave it as `Other`.
5. Under "Root Directory", click Edit and select `server`.
6. Add the following **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for tokens.
   - `FRONTEND_URL`: Leave blank for now, we will update this after deploying the frontend.
7. Click **Deploy**. Vercel will use the `vercel.json` file inside the `server` directory to deploy the Express API as serverless functions.
8. Once deployed, copy the production URL (e.g., `https://bookswap-backend.vercel.app`).

> **Note on Socket.io:** Serverless environments like Vercel do not natively support long-lived WebSocket connections. Socket.io will automatically fall back to HTTP Long-Polling. For true WebSocket performance, consider deploying the backend to Render, Railway, or Heroku instead.

## 2. Deploying the Frontend (Client)

1. Go back to your Vercel Dashboard and click **Add New Project**.
2. Import the *same* repository.
3. Under "Root Directory", click Edit and select `client`.
4. Vercel should automatically detect **Vite** as the Framework Preset.
5. Add the following **Environment Variable**:
   - `VITE_API_URL`: Paste the backend production URL you copied earlier (e.g., `https://bookswap-backend.vercel.app`).
6. Click **Deploy**.
7. Once deployed, copy the frontend production URL (e.g., `https://bookswap.vercel.app`).

## 3. Finalizing CORS

1. Go to your **Backend (Server)** project settings on Vercel.
2. Navigate to **Environment Variables**.
3. Add/Update the `FRONTEND_URL` variable to be your newly deployed frontend URL (`https://bookswap.vercel.app`).
4. **Redeploy** the backend so the new environment variable takes effect.

Congratulations! Your BookSwap MERN platform is now live.
