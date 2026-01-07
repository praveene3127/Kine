const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased limit for base64 frames

/* =====================
   FILE STORAGE SETUP
===================== */
const DATA_DIR = __dirname;
const DOCS_FILE = path.join(DATA_DIR, "documents.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CALIBRATION_FILE = path.join(DATA_DIR, "calibration.json");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const ERRORS_FILE = path.join(DATA_DIR, "errors.json");

// Generic file helpers
function loadJSON(file, defaultValue = []) {
  if (!fs.existsSync(file)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return defaultValue;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Load all data
let documents = loadJSON(DOCS_FILE, []);
let settings = loadJSON(SETTINGS_FILE, { speechRate: 1.0, feedbackMode: "verbose", highContrast: false });
let calibrationData = loadJSON(CALIBRATION_FILE, null);
let feedbackList = loadJSON(FEEDBACK_FILE, []);
let errorLogs = loadJSON(ERRORS_FILE, []);

// Calibration session state (in-memory)
let calibrationSession = { active: false, samples: [] };

/* =====================
   1. SYSTEM
===================== */
// Root route - API documentation
app.get("/", (req, res) => {
  res.json({
    name: "Kine Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      system: ["GET /api/health"],
      gesture: [
        "POST /api/gesture/interpret",
        "POST /api/gesture/calibration/start",
        "POST /api/gesture/calibration/sample",
        "POST /api/gesture/calibration/complete"
      ],
      documents: [
        "POST /api/documents",
        "GET /api/documents",
        "GET /api/documents/:id",
        "PUT /api/documents/:id",
        "DELETE /api/documents/:id",
        "POST /api/documents/:id/append"
      ],
      accessibility: [
        "GET /api/user/accessibility",
        "PUT /api/user/accessibility"
      ],
      audio: [
        "POST /api/audio/tts",
        "POST /api/audio/cue"
      ],
      feedback: [
        "POST /api/errors/gesture",
        "POST /api/feedback"
      ],
      privacy: [
        "GET /api/privacy/summary",
        "DELETE /api/privacy/delete-all"
      ]
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* =====================
   2. GESTURE PROCESSING
===================== */
app.post("/api/gesture/interpret", (req, res) => {
  const { rawText, frame } = req.body;

  if (rawText) {
    return res.json({ text: rawText.trim() });
  }

  if (frame) {
    // Placeholder for future Python + MediaPipe processing
    return res.json({ text: "Gesture frame received" });
  }

  return res.status(400).json({ error: "No valid input provided (rawText or frame required)" });
});

app.post("/api/gesture/calibration/start", (req, res) => {
  calibrationSession = { active: true, samples: [], startedAt: new Date().toISOString() };
  res.json({ success: true, message: "Calibration session started" });
});

app.post("/api/gesture/calibration/sample", (req, res) => {
  if (!calibrationSession.active) {
    return res.status(400).json({ error: "No active calibration session" });
  }

  const { frame, landmarks, gesture } = req.body;
  if (!frame && !landmarks) {
    return res.status(400).json({ error: "Sample data required (frame or landmarks)" });
  }

  calibrationSession.samples.push({
    gesture: gesture || "unknown",
    timestamp: new Date().toISOString(),
    hasFrame: !!frame,
    hasLandmarks: !!landmarks
  });

  res.json({ success: true, sampleCount: calibrationSession.samples.length });
});

app.post("/api/gesture/calibration/complete", (req, res) => {
  if (!calibrationSession.active) {
    return res.status(400).json({ error: "No active calibration session" });
  }

  calibrationData = {
    completedAt: new Date().toISOString(),
    sampleCount: calibrationSession.samples.length,
    samples: calibrationSession.samples
  };
  saveJSON(CALIBRATION_FILE, calibrationData);

  calibrationSession = { active: false, samples: [] };
  res.json({ success: true, message: "Calibration saved", data: calibrationData });
});

/* =====================
   3. DOCUMENTS (CRUD)
===================== */
app.post("/api/documents", (req, res) => {
  const doc = {
    id: Date.now().toString(),
    content: req.body.content || "",
    title: req.body.title || "Untitled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  documents.push(doc);
  saveJSON(DOCS_FILE, documents);
  res.json(doc);
});

app.get("/api/documents", (req, res) => {
  res.json(documents);
});

app.get("/api/documents/:id", (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json(doc);
});

app.put("/api/documents/:id", (req, res) => {
  const index = documents.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  documents[index] = {
    ...documents[index],
    content: req.body.content ?? documents[index].content,
    title: req.body.title ?? documents[index].title,
    updatedAt: new Date().toISOString()
  };

  saveJSON(DOCS_FILE, documents);
  res.json(documents[index]);
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  documents = documents.filter(doc => doc.id !== id);
  saveJSON(DOCS_FILE, documents);
  res.json({ success: true });
});

app.post("/api/documents/:id/append", (req, res) => {
  const index = documents.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text required" });
  }

  documents[index].content += text;
  documents[index].updatedAt = new Date().toISOString();

  saveJSON(DOCS_FILE, documents);
  res.json(documents[index]);
});

/* =====================
   4. ACCESSIBILITY
===================== */
app.get("/api/user/accessibility", (req, res) => {
  res.json(settings);
});

app.put("/api/user/accessibility", (req, res) => {
  settings = {
    ...settings,
    speechRate: req.body.speechRate ?? settings.speechRate,
    feedbackMode: req.body.feedbackMode ?? settings.feedbackMode,
    highContrast: req.body.highContrast ?? settings.highContrast
  };
  saveJSON(SETTINGS_FILE, settings);
  res.json(settings);
});

/* =====================
   5. AUDIO (STUBS)
===================== */
app.post("/api/audio/tts", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text required" });
  }
  // Stub: In production, this would trigger actual TTS
  res.json({ success: true, message: "TTS request received", text });
});

app.post("/api/audio/cue", (req, res) => {
  const { cueType } = req.body;
  // Stub: In production, this would trigger audio/haptic cue
  res.json({ success: true, message: "Audio cue triggered", cueType: cueType || "default" });
});

/* =====================
   6. FEEDBACK & ERRORS
===================== */
app.post("/api/errors/gesture", (req, res) => {
  const errorLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    error: req.body.error || "Unknown error",
    context: req.body.context || {}
  };

  errorLogs.push(errorLog);
  saveJSON(ERRORS_FILE, errorLogs);
  res.json({ success: true, logged: errorLog.id });
});

app.post("/api/feedback", (req, res) => {
  const feedback = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    message: req.body.message || "",
    rating: req.body.rating || null,
    category: req.body.category || "general"
  };

  feedbackList.push(feedback);
  saveJSON(FEEDBACK_FILE, feedbackList);
  res.json({ success: true, id: feedback.id });
});

/* =====================
   7. PRIVACY & DATA
===================== */
app.get("/api/privacy/summary", (req, res) => {
  res.json({
    documents: documents.length,
    hasCalibration: calibrationData !== null,
    hasSettings: true,
    feedbackCount: feedbackList.length,
    errorLogCount: errorLogs.length
  });
});

app.delete("/api/privacy/delete-all", (req, res) => {
  // Clear all data
  documents = [];
  settings = { speechRate: 1.0, feedbackMode: "verbose", highContrast: false };
  calibrationData = null;
  feedbackList = [];
  errorLogs = [];
  calibrationSession = { active: false, samples: [] };

  // Delete files
  [DOCS_FILE, SETTINGS_FILE, CALIBRATION_FILE, FEEDBACK_FILE, ERRORS_FILE].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });

  res.json({ success: true, message: "All user data deleted" });
});

/* =====================
   START SERVER
===================== */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
});
