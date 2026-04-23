# Premium MERN Chat Application

A high-end, real-time chat application built with the MERN stack and Socket.io.

## Features
- **Real-time Messaging**: Instant message delivery using WebSockets.
- **Online Status**: Real-time tracking of online users.
- **Authentication**: Secure JWT-based auth with HTTP-only cookies.
- **Glassmorphic UI**: Modern, translucent design with smooth animations.
- **Image Support**: Share images in chats (powered by Cloudinary).
- **Responsive**: Fully responsive design for mobile and desktop.

## Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas connection string.
- Cloudinary account for image uploads (optional, but required for images).

## Setup

1. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Environment Variables**:
   Update `backend/.env` with your MongoDB URI and Cloudinary credentials.

3. **Run the App**:
   ```bash
   npm run dev
   ```

## Tech Stack
- **Frontend**: React, Vite, Zustand, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Socket.io, Mongoose.
- **Database**: MongoDB.
