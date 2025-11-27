const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL bağlantı havuzu
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "whatsapp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

// Veritabanı bağlantı testi
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ MySQL bağlantısı başarılı");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL bağlantı hatası:", err.message);
  });

// API Endpoints

// Tüm kullanıcıları getir (son mesajları ile)
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        user_id,
        MAX(created_at) as last_message_time,
        (SELECT message FROM messages m2 
         WHERE m2.user_id = m1.user_id 
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT direction FROM messages m2 
         WHERE m2.user_id = m1.user_id 
         ORDER BY created_at DESC LIMIT 1) as last_direction
      FROM messages m1
      GROUP BY user_id
      ORDER BY last_message_time DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Belirli bir kullanıcının tüm mesajlarını getir
app.get("/api/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mesaj ara (tüm mesajlarda)
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const [rows] = await pool.query(
      `SELECT * FROM messages 
       WHERE message LIKE ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: error.message });
  }
});

// İstatistikler
app.get("/api/stats", async (req, res) => {
  try {
    const [totalMessages] = await pool.query(
      "SELECT COUNT(*) as count FROM messages"
    );
    const [totalUsers] = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM messages"
    );
    const [incomingMessages] = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE direction = 'in'"
    );
    const [outgoingMessages] = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE direction = 'out'"
    );
    const [todayMessages] = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = CURDATE()"
    );

    res.json({
      totalMessages: totalMessages[0].count,
      totalUsers: totalUsers[0].count,
      incomingMessages: incomingMessages[0].count,
      outgoingMessages: outgoingMessages[0].count,
      todayMessages: todayMessages[0].count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Son 7 günün mesaj istatistikleri
app.get("/api/stats/weekly", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN direction = 'in' THEN 1 ELSE 0 END) as incoming,
        SUM(CASE WHEN direction = 'out' THEN 1 ELSE 0 END) as outgoing
      FROM messages
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        database: "disconnected",
        error: error.message,
      });
  }
});

// Frontend'i serve et (production'da)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
