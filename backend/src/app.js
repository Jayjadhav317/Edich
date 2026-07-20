const express = require("express");
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/user.routes");
const drawingRoutes = require("./routes/drawing.routes");

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/drawings", drawingRoutes);

module.exports = app;