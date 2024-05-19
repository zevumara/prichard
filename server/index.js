import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/app/index.html");
});

server.listen(port, () => {
  console.log(`Servidor andando en el puerto ${port}`);
});
