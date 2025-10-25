// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    const playerSymbol = rooms[roomId].length === 1 ? "X" : "O";
    socket.emit("playerSymbol", playerSymbol);

    if (rooms[roomId].length === 2) {
      io.to(roomId).emit("startGame");
    }
  });

  socket.on("makeMove", ({ roomId, index, symbol }) => {
    socket.to(roomId).emit("moveMade", { index, symbol });
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
      if (rooms[room].length === 0) delete rooms[room];
    }
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
