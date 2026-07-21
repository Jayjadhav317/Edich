const express = require("express");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

const userRoutes = require("./routes/user.routes");
const drawingRoutes = require("./routes/drawing.routes");

app.use("/api/users", userRoutes);
app.use("/api/drawings", drawingRoutes);

module.exports = app;