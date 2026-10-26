import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Note from "./models/Note.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Frontend home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST route: Create and save a note
app.post("/api/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Please enter both title and content."
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim()
    });

    res.status(201).json({
      message: "Note saved successfully!",
      note
    });
  } catch (error) {
    console.error("Error saving note:", error.message);
    res.status(500).json({
      message: "Failed to save note."
    });
  }
});

// GET route: Retrieve all notes
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error.message);
    res.status(500).json({
      message: "Failed to fetch notes."
    });
  }
});

// Connect to MongoDB and start the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
