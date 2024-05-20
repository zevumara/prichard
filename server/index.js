import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import OpenAI from "openai";
import { config as configDotenv } from "dotenv";

configDotenv();

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

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

app.get("/loading.svg", (req, res) => {
  res.sendFile(process.cwd() + "/app/loading.svg");
});

app.get("/control", (req, res) => {
  res.sendFile(process.cwd() + "/app/control.html");
});

app.use(express.json());

app.post("/suggestions", async (req, res) => {
  const { prompt } = req.body;
  try {
    const chat_completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    res.json({ suggestions: chat_completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ suggestions: error });
    console.log("Error:", error);
  }
});

server.listen(port, () => {
  console.log(`Servidor andando en el puerto ${port}`);
});
