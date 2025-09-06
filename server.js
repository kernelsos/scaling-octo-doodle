const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "gagandev@2004",
  database: "login_info",
  port: 3306
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// ✅ ROUTES MUST GO HERE (after `app` is created)

// Signup Route
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ success: false, message: "All fields required" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) return res.status(500).send({ success: false, message: "Server error" });

    if (result.length > 0) {
      return res.send({ success: false, message: "User already exists" });
    }

    const insertSql = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(insertSql, [email, password], (err, result) => {
      if (err) return res.status(500).send({ success: false, message: "Signup failed" });
      return res.send({ success: true, message: "Signup successful" });
    });
  });
});

// (Optional) Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).send({ success: false, message: "Server error" });
    if (result.length > 0) {
      return res.send({ success: true, message: "Login successful" });
    } else {
      return res.send({ success: false, message: "Invalid credentials" });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
