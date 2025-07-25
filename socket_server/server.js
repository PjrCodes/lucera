/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");
// Load environment variables from .env.local file for the socket server.
const envPath = path.resolve(__dirname, "../.env.local");
require("dotenv").config({ path: envPath });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with CORS configuration.
// The FRONTEND_ORIGIN environment variable is required for security.
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// This function sets up a MongoDB change stream to listen for new messages.
// It requires MONGODB_URI and DB_NAME environment variables.
async function startMongoChangeStream() {
  console.log("MONGODB_URI:", process.env.MONGODB_URI);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("FRONTEND_ORIGIN:", process.env.FRONTEND_ORIGIN);

  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db(process.env.DB_NAME);
  const collection = db.collection("messages");

  const changeStream = collection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const newNotification = change.fullDocument;
      console.log(
        "[NEW_NOTIF]",
        (
          newNotification.from +
          " -> " +
          newNotification.to +
          " : " +
          newNotification.message
        ).substring(0, 50),
      );
      io.emit("new-notification", newNotification);
    }
  });

  changeStream.on("error", (err) => {
    console.error("[STM_ERROR]", err);
  });

  console.log(
    "[START_STM] MongoDB change stream started for collection:",
    collection.collectionName,
  );
}

server.listen(4000, () => {
  console.log("Socket server running on http://localhost:4000");
  startMongoChangeStream().catch(console.error);
});

