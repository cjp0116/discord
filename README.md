<<<<<<< HEAD
# discord
discord clone using nextjs15
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Real-Time Chat Features

This Discord clone now includes **real-time WebSocket chat functionality** with the following features:

### 🚀 Real-Time Features
- **Instant messaging** - Messages appear immediately without page refresh
- **Live message editing** - Edit messages in real-time
- **Real-time reactions** - Add/remove reactions instantly
- **Message deletion** - Delete messages with immediate updates
- **Connection status** - Visual indicators for WebSocket connection status

### 🔧 Technical Implementation
- **WebSocket Server** - Custom Socket.IO server for real-time communication
- **Fallback Support** - Graceful fallback to server actions if WebSocket unavailable
- **Authentication** - Secure WebSocket connections with user authentication
- **Channel Management** - Join/leave channels dynamically
- **Error Handling** - Comprehensive error handling and user feedback

### 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Real-Time Features**
   - Open multiple browser tabs/windows
   - Join the same channel in different tabs
   - Send messages and see them appear instantly across all tabs
   - Edit messages and see updates in real-time
   - Add reactions and see them update immediately

### 🔄 How It Works

1. **WebSocket Connection**: Client connects to WebSocket server on page load
2. **Authentication**: User authenticates via Supabase session
3. **Channel Joining**: User joins specific channels for real-time updates
4. **Message Handling**: All message operations go through WebSocket first
5. **Fallback**: If WebSocket fails, falls back to server actions
6. **Database Sync**: All changes are persisted to Supabase database

### 📊 Performance Benefits

- **No polling** - Eliminates constant HTTP requests
- **Instant updates** - Real-time message delivery
- **Reduced server load** - WebSocket connections are more efficient
- **Better UX** - Immediate feedback for all actions
- **Scalable** - WebSocket server can handle many concurrent connections

### 🛡️ Security Features

- **User authentication** - Only authenticated users can connect
- **Channel access control** - Users can only join channels they have access to
- **Message ownership** - Users can only edit/delete their own messages
- **Server-side validation** - All operations validated on server

---

## Running with Docker

You can run this project in a containerized environment using Docker and Docker Compose.

- **Node.js version:** The Docker image uses Node.js `22.13.1-slim`.
- **Exposed port:** The application runs on port `3000` inside the container and is mapped to port `3000` on your host.
- **Environment variables:**
  - The Docker Compose file is set up to use a `.env` file for environment variables. Uncomment the `env_file: ./.env` line in `docker-compose.yml` if you have a `.env` file with your configuration.

### Build and Run

To build and start the application using Docker Compose:

```bash
docker compose up --build
```

This will build the Docker image and start the `ts-app` service. The app will be available at [http://localhost:3000](http://localhost:3000).

### Customization

- If you need to provide environment variables, create a `.env` file in the project root and uncomment the `env_file` line in `docker-compose.yml`.
- The container runs as a non-root user for improved security.

---
>>>>>>> b2d3bc8 (fir commit)
