const express = require("express");
const pool = require("../config/db");
const { hash } = require("../utils/hash");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const hashed = hash(password);

  // Check if email already exists (safe with your existing Alembic data)
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (existing.rows.length > 0) {
    return res.status(400).json({ detail: "email already exists" });
  }

  try {
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashed],
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ detail: "something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  const userRes = await pool.query(
    "SELECT id, email FROM users WHERE id = $1",
    [req.params.id],
  );
  const user = userRes.rows[0];

  if (!user)
    return res
      .status(404)
      .json({ detail: `the user with id: ${req.params.id} is not found` });

  res.json(user);
});

module.exports = router;
