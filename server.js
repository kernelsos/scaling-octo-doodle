const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the parent directory
// This allows serving Homepage.html and other static files
app.use(express.static(path.join(__dirname, '..')));

// Database connection with better error handling
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "gagandev@2004",
  database: "login_info",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    console.error("Make sure MySQL is running and credentials are correct");
    return;
  }
  console.log("Connected to MySQL!");
});

// ✅ ROUTES

// Signup Route
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) {
      console.error("Database error during signup check:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (result.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const insertSql = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(insertSql, [email, password], (err, result) => {
      if (err) {
        console.error("Database error during signup insert:", err);
        return res.status(500).json({ success: false, message: "Signup failed" });
      }
      return res.json({ success: true, message: "Signup successful" });
    });
  });
});

// Login Route with better error handling
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
    
    if (result.length > 0) {
      // Login successful - send success response
      // The client should handle the redirect
      return res.json({ 
        success: true, 
        message: "Login successful",
        redirect: "/Frontend/Homepage.html"  
      });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// Route to serve Homepage.html directly (optional)
app.get("/homepage", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Homepage.html'));
});

// Health check route for debugging
app.get("/health", (req, res) => {
  db.ping((err) => {
    if (err) {
      return res.status(500).json({ 
        status: "unhealthy", 
        database: "disconnected",
        error: err.message 
      });
    }
    res.json({ 
      status: "healthy", 
      database: "connected",
      port: PORT 
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});