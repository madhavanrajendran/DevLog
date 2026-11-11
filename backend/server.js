const express = require("express");
const cors = require("cors");

require("dotenv").config();

require("./config/db");

const app = express();

// 🌍 CORS
app.use(cors({
  origin: [
    "https://devlog-rosy-kappa.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// 📦 MIDDLEWARE
app.use(express.json());

// 🧪 TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "DevLog API Running 🚀",
  });
});

// 🔐 AUTH ROUTES
app.use(
  "/auth",
  require("./routes/authRoutes")
);

// 📝 BLOG ROUTES
app.use(
  "/blogs",
  require("./routes/blogRoutes")
);

// 📬 CONTACT ROUTES
app.use(
  "/contact",
  require("./routes/contactRoutes")
);

// 🚀 SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} 🚀`
  );
});