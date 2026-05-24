require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const { initSocket } = require("./services/socketService");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    // Remove invalid compound index on two array fields (parallel arrays error)
    try {
      const users = mongoose.connection.collection("users");
      const indexes = await users.indexes();
      for (const idx of indexes) {
        const keys = Object.keys(idx.key || {});
        if (keys.includes("teachSkills") && keys.includes("learnSkills")) {
          await users.dropIndex(idx.name);
          console.log(`Dropped invalid index: ${idx.name}`);
        }
      }
    } catch (err) {
      if (err.code !== 27) {
        console.warn("Index cleanup:", err.message);
      }
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hfConfigured: Boolean(process.env.HF_API_KEY),
    model: process.env.HF_MODEL || "google/flan-t5-large",
    fallbackModel:
      process.env.HF_FALLBACK_MODEL || "mistralai/Mistral-7B-Instruct-v0.2",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/verification", require("./routes/verificationRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/connections", require("./routes/connectionRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.io enabled for real-time chat");
  if (!process.env.HF_API_KEY) {
    console.warn("Warning: HF_API_KEY not set — AI quiz will use dynamic fallback");
  }
});