const express = require("express");
const pool = require("../config/db");
const { verify } = require("../utils/hash");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  // Debug - you WILL see this in VS Code terminal
  console.log("🔍 Login body received:", req.body);

  const body = req.body || {}; // prevents undefined crash
  const email = body.email || body.username; // supports both JSON and FastAPI form
  const password = body.password;

  if (!email || !password) {
    return res.status(422).json({
      detail: "email (or username) and password are required",
    });
  }

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = userRes.rows[0];

    if (!user || !verify(password, user.password)) {
      return res.status(403).json({ detail: "invalid credentials" });
    }

    const access_token = jwt.sign(
      { user_id: user.id },
      process.env.SECRET_KEY,
      {
        expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION_TIME_MINUTES || 60}m`,
        algorithm: process.env.ALGORITHM || "HS256",
      },
    );

    res.json({ access_token, token_type: "bearer" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ detail: "something went wrong" });
  }
});

module.exports = router;
