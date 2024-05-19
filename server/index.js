import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a client has connected");

  socket.on("disconnect", () => {
    console.log("a client has disconnected");
  });

  socket.on("input", (input) => {
    console.log("input pressed:", input);
    io.emit("input", input);
  });
});

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/app/index.html");
});

app.get("/control", (req, res) => {
  res.sendFile(process.cwd() + "/app/control.html");
});

server.listen(port, () => {
  console.log(`Servidor andando en el puerto ${port}`);
});
