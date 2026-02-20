import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("checkin.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    type TEXT NOT NULL, -- 'morning' or 'evening'
    date TEXT NOT NULL, -- YYYY-MM-DD
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/time", (req, res) => {
    res.json({ timestamp: new Date().getTime() });
  });

  app.get("/api/stats", (req, res) => {
    try {
      // Get records from the last 7 days to support weekly report
      const sevenDaysAgo = new Date(new Date().getTime() + 8 * 3600000 - 7 * 24 * 3600000).toISOString().split('T')[0];
      const records = db.prepare(`
        SELECT * FROM checkins 
        WHERE date >= ?
        ORDER BY timestamp DESC
      `).all(sevenDaysAgo);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/checkin", (req, res) => {
    const { name, team, type, date } = req.body;
    
    if (!name || !team || !type || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check if already checked in for this type and date
      const existing = db.prepare(`
        SELECT id FROM checkins 
        WHERE name = ? AND team = ? AND type = ? AND date = ?
      `).get(name, team, type, date);

      if (existing) {
        return res.status(400).json({ error: "今日已打卡" });
      }

      // Use current server time for timestamp
      const timestamp = new Date().toISOString();

      const info = db.prepare(`
        INSERT INTO checkins (name, team, type, date, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, team, type, date, timestamp);

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Check-in failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] API endpoints: /api/stats, /api/checkin`);
  });
}

startServer();
