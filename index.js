const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🔥 MUST BE BEFORE ALL ROUTES
app.use(express.json()); // handles raw JSON
app.use(express.urlencoded({ extended: true })); // handles form-data (FastAPI style)

// CORS
app.use(
  cors({
    origin: "https://www.google.com",
    credentials: true,
    methods: ["*"],
    allowedHeaders: ["*"],
  }),
);

// Routes (now after parsers)
app.use(require("./routes/auth")); // /login
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/votes", require("./routes/votes"));

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
