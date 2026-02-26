const express = require("express");
const pool = require("../config/db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", async (req, res) => {
  const { post_id, vote_dir } = req.body; // vote_dir: 1 = up, 0 = down

  // check post exists
  const postRes = await pool.query("SELECT id FROM posts WHERE id = $1", [
    post_id,
  ]);
  if (!postRes.rows[0])
    return res
      .status(404)
      .json({ detail: `the post with id: ${post_id} is not found` });

  const existing = await pool.query(
    "SELECT * FROM votes WHERE post_id = $1 AND user_id = $2",
    [post_id, req.user.id],
  );

  if (vote_dir === 1) {
    if (existing.rows[0])
      return res
        .status(409)
        .json({
          detail: `user ${req.user.id} has already voted on post ${post_id}`,
        });

    await pool.query("INSERT INTO votes (post_id, user_id) VALUES ($1, $2)", [
      post_id,
      req.user.id,
    ]);
    return res.status(201).json({ message: "successfully added vote" });
  } else {
    if (!existing.rows[0])
      return res.status(404).json({ detail: "vote does not exist" });

    await pool.query("DELETE FROM votes WHERE post_id = $1 AND user_id = $2", [
      post_id,
      req.user.id,
    ]);
    return res.json({ message: "successfully deleted vote" });
  }
});

module.exports = router;
