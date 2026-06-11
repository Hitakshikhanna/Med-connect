const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 

const app = express();
const PORT = 5000;

// 🛠️ MIDDLEWARE
app.use(cors());
app.use(express.json()); // Allows your server to read JSON data sent from frontend forms

// 🔌 DATABASE CONNECTION
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MySqL05091824@#', 
  database: 'medconnect', 
  port: 3300 // Your confirmed MySQL port!
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('🚀 Connected to MySQL Database successfully!');
});

// ==========================================
// 🔑 1. AUTHENTICATION ROUTES (SIGNUP & LOGIN)
// ==========================================

// Sign-Up Route (Inserts into 'users')
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Email already registered!' });

    const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(insertQuery, [username, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, userId: result.insertId }); 
    });
  });
});

// Login Route (Validates against 'users')
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const sqlQuery = `SELECT id, username FROM users WHERE email = ? AND password = ?`;

  db.query(sqlQuery, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ success: true, userId: results[0].id, username: results[0].username });
  });
});

// ==========================================
// ❤️ 2. BLOOD PRESSURE & PULSE LOGS ROUTES
// ==========================================

// Save Blood Pressure Log (Inserts into 'bp_logs')
app.post('/api/log-bp', (req, res) => {
  const { user_id, systolic, diastolic, pulse, logged_date } = req.body;
  const sqlQuery = `INSERT INTO bp_logs (user_id, systolic, diastolic, pulse, logged_date) VALUES (?, ?, ?, ?, ?)`;
  
  db.query(sqlQuery, [user_id, systolic, diastolic, pulse || null, logged_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Blood Pressure log saved permanently!' });
  });
});

// Fetch Blood Pressure History
app.get('/api/get-bp/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sqlQuery = `SELECT id, systolic, diastolic, pulse, logged_date FROM bp_logs WHERE user_id = ? ORDER BY logged_date DESC`;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, logs: results });
  });
});

// ==========================================
// 🍬 3. BLOOD SUGAR (GLUCOSE) LOGS ROUTES
// ==========================================

// Save Blood Sugar Log (Inserts into 'sugar_logs')
app.post('/api/log-sugar', (req, res) => {
  const { user_id, sugar_level, meal_time, logged_date } = req.body;
  const sqlQuery = `INSERT INTO sugar_logs (user_id, sugar_level, meal_time, logged_date) VALUES (?, ?, ?, ?)`;
  
  db.query(sqlQuery, [user_id, sugar_level, meal_time || 'Fasting', logged_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Blood Sugar log saved permanently!' });
  });
});

// Fetch Blood Sugar History
app.get('/api/get-sugar/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sqlQuery = `SELECT id, sugar_level, meal_time, logged_date FROM sugar_logs WHERE user_id = ? ORDER BY logged_date DESC`;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, logs: results });
  });
});

// ==========================================
// 💊 4. MEDICATIONS TRACKER ROUTES
// ==========================================

// Save a New Medication (Inserts into 'medications')
app.post('/api/log-medication', (req, res) => {
  const { user_id, med_name, dosage, frequency, start_date } = req.body;
  const sqlQuery = `INSERT INTO medications (user_id, med_name, dosage, frequency, start_date) VALUES (?, ?, ?, ?, ?)`;
  
  db.query(sqlQuery, [user_id, med_name, dosage, frequency, start_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Medication added successfully to your profile!' });
  });
});

// Fetch Medications List
app.get('/api/get-medications/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sqlQuery = `SELECT id, med_name, dosage, frequency, start_date FROM medications WHERE user_id = ?`;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, medications: results });
  });
});

// ==========================================
// 📁 5. DOCUMENT REPORTS ROUTES (FIXED TABLE NAME)
// ==========================================

// Save Uploaded Document Path Reference (Inserts into 'document_reports')
app.post('/api/log-document', (req, res) => {
  const { user_id, file_name, file_url, uploaded_date } = req.body;
  const sqlQuery = `INSERT INTO document_reports (user_id, file_name, file_url, uploaded_date) VALUES (?, ?, ?, ?)`;
  
  db.query(sqlQuery, [user_id, file_name, file_url, uploaded_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Document reference locked in securely!' });
  });
});

// Fetch All Uploaded Documents Links
app.get('/api/get-documents/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sqlQuery = `SELECT id, file_name, file_url, uploaded_date FROM document_reports WHERE user_id = ? ORDER BY uploaded_date DESC`;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, documents: results });
  });
});

// ==========================================
// 🗑️ 6. UNIVERSAL ROW DELETE ENDPOINT
// ==========================================
app.delete('/api/delete-row/:table_name/:id', (req, res) => {
  const { table_name, id } = req.params;
  
  // Whitelist your exact table names to keep database deletions fully secure
  const allowedTables = ['bp_logs', 'sugar_logs', 'medications', 'document_reports'];
  if (!allowedTables.includes(table_name)) {
    return res.status(400).json({ error: 'Invalid operation target table' });
  }

  const sqlQuery = `DELETE FROM ?? WHERE id = ?`;
  db.query(sqlQuery, [table_name, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Data entry deleted successfully from database!' });
  });
});

// 🚀 START THE BACKEND SERVER
app.listen(PORT, () => {
  console.log(`📡 Backend Server is live on http://localhost:${PORT}`);
});