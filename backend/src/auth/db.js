const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
      console.log("Database Connection Error:", err.message);
      process.exit(1);
    });
};

module.exports = connectDB;