const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "could not validate credentials" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY, {
      algorithms: [process.env.ALGORITHM],
    });

    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded.user_id,
    ]);
    const user = userRes.rows[0];

    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: "could not validate credentials" });
  }
};

module.exports = auth;
