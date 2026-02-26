const express = require("express");
const pool = require("../config/db");
const auth = require("../middleware/auth");

const router = express.Router();

// All posts routes require auth
router.use(auth);

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const skip = parseInt(req.query.skip) || 0;
  const search = req.query.search || "";

  const postsRes = await pool.query(
    `
    SELECT p.*, COUNT(v.post_id) AS votes
    FROM posts p
    LEFT JOIN votes v ON v.post_id = p.id
    WHERE p.title ILIKE $1
    GROUP BY p.id
    LIMIT $2 OFFSET $3
  `,
    [`%${search}%`, limit, skip],
  );

  // Return similar shape to original FastAPI (you can adjust if your frontend expects flat)
  const formatted = postsRes.rows.map((row) => ({
    Post: {
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      owner_id: row.owner_id,
    },
    votes: parseInt(row.votes) || 0,
  }));

  res.json(formatted);
});

router.get("/:id", async (req, res) => {
  const postRes = await pool.query(
    `
    SELECT p.*, COUNT(v.post_id) AS votes
    FROM posts p
    LEFT JOIN votes v ON v.post_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `,
    [req.params.id],
  );

  const row = postRes.rows[0];
  if (!row)
    return res
      .status(404)
      .json({ detail: `the post with id: ${req.params.id} is not found` });

  res.json({
    Post: {
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      owner_id: row.owner_id,
    },
    votes: parseInt(row.votes) || 0,
  });
});

router.post("/", async (req, res) => {
  const { title, content, published = true } = req.body;
  const newPost = await pool.query(
    "INSERT INTO posts (title, content, published, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, content, published, req.user.id],
  );
  res.status(201).json(newPost.rows[0]);
});

router.put("/:id", async (req, res) => {
  // published defaults to true — exactly like FastAPI's PostBase model
  const { title, content, published = true } = req.body;

  // Optional: strict validation like FastAPI (422 if title/content missing)
  if (title === undefined || content === undefined) {
    return res.status(422).json({
      detail: "title and content are required",
    });
  }

  const postRes = await pool.query("SELECT * FROM posts WHERE id = $1", [
    req.params.id,
  ]);
  const post = postRes.rows[0];

  if (!post)
    return res
      .status(404)
      .json({ detail: `the post with id: ${req.params.id} is not found` });
  if (post.owner_id !== req.user.id)
    return res
      .status(403)
      .json({ detail: "not authorized to perform this action" });

  const updated = await pool.query(
    "UPDATE posts SET title=$1, content=$2, published=$3 WHERE id=$4 RETURNING *",
    [title, content, published, req.params.id],
  );

  res.json(updated.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const postRes = await pool.query("SELECT * FROM posts WHERE id = $1", [
    req.params.id,
  ]);
  const post = postRes.rows[0];

  if (!post)
    return res
      .status(404)
      .json({ detail: `the post with id: ${req.params.id} is not found` });
  if (post.owner_id !== req.user.id)
    return res
      .status(403)
      .json({ detail: "not authorized to perform this action" });

  await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

module.exports = router;
