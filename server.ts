import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute DB path (important for PM2)
const db = new Database(path.join(process.cwd(), "checkin.db"));

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3007;

  app.use(express.json());

  /* ======================
     API ROUTES
  ====================== */

  app.get("/api/time", (req, res) => {
    res.json({ timestamp: new Date().getTime() });
  });

  app.get("/api/stats", (req, res) => {
    try {
      const sevenDaysAgo = new Date(
        new Date().getTime() + 8 * 3600000 - 7 * 24 * 3600000
      )
        .toISOString()
        .split("T")[0];

      const records = db
        .prepare(
          `
        SELECT * FROM checkins 
        WHERE date >= ?
        ORDER BY timestamp DESC
      `
        )
        .all(sevenDaysAgo);

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
      const existing = db
        .prepare(
          `
        SELECT id FROM checkins 
        WHERE name = ? AND team = ? AND type = ? AND date = ?
      `
        )
        .get(name, team, type, date);

      if (existing) {
        return res.status(400).json({ error: "今日已打卡" });
      }

      const timestamp = new Date().toISOString();

      const info = db
        .prepare(
          `
        INSERT INTO checkins (name, team, type, date, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `
        )
        .run(name, team, type, date, timestamp);

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Check-in failed" });
    }
  });

  /* ======================
     ENVIRONMENT HANDLING
  ====================== */

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log("Running in DEVELOPMENT mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode");

    // IMPORTANT: dist is one level up from dist-server
    const distPath = path.join(__dirname, "../dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}

startServer();
