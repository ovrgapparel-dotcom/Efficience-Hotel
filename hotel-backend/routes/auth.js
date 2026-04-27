const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

const SECRET = process.env.SECRET_KEY || "SECRET_KEY";

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users(email, password) VALUES($1,$2)",
      [email, hash]
    );

    res.json({ message: "User created" });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) return res.status(401).send("User not found");

    const valid = await bcrypt.compare(password, user.rows[0].password);

    if (!valid) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user.rows[0].id }, SECRET);

    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email } });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
