require("dotenv").config();

const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const app = require("./src/app");
const connectDB = require("./src/auth/db");
const http = require("http");
const { Server } = require("socket.io");

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://edich.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined room ${boardId}`);
  });

  socket.on("canvas-update", ({ boardId, elements }) => {
    // Broadcast updates to all other users in the room
    socket.to(boardId).emit("canvas-update", elements);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});