require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const pollRoutes = require("./routes/polls");
const roomRoutes = require("./routes/rooms");
const userRoutes = require("./routes/user");
const { setupSocketHandlers } = require("./socket");

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/user", userRoutes);

// Socket.io handlers
setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`QuickPoll backend running on port ${PORT}`);
});

module.exports = { app, server, io };
