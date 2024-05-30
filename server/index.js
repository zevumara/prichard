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

  socket.on("control", (input) => {
    console.log("a control has connected");
    io.emit("control", 1);
  });
});

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/app/index.html");
});

app.get("/loading.svg", (req, res) => {
  res.sendFile(process.cwd() + "/app/loading.svg");
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(process.cwd() + "/app/favicon.ico");
});

app.get("/input.ogg", (req, res) => {
  res.sendFile(process.cwd() + "/app/input.ogg");
});

app.get("/connected.ogg", (req, res) => {
  res.sendFile(process.cwd() + "/app/connected.ogg");
});

app.get("/suggest.ogg", (req, res) => {
  res.sendFile(process.cwd() + "/app/suggest.ogg");
});

app.get("/control", (req, res) => {
  res.sendFile(process.cwd() + "/app/control.html");
});

app.get("/joystick", (req, res) => {
  res.sendFile(process.cwd() + "/app/joystick.html");
});

app.use(express.json());

app.post("/suggestions", async (req, res) => {
  const { word, phrase } = req.body;
  let prompt;
  if (phrase && word) {
    prompt = `Necesito que intentes adivinar la próxima palabra de esta frase "${phrase}". La palabra empieza con las siguientes letras: "${word}". Dame una lista de cinco posibles palabras y ordénalas en orden de probabilidad, las más probables primero. Solo palabras existentes en el idioma español. Respondé solo con el listado. Si encontrás respondé solo con el listado por orden númerico`;
  } else if (word) {
    prompt = `Necesito que intentes adivinar la palabra que estoy escribiendo. Empieza con las siguientes letras: "${word}". Dame una lista de cinco posibles palabras y ordénalas en orden de probabilidad, las más probables primero. Solo palabras existentes en el idioma español. Respondé solo con el listado. Si encontrás respondé solo con el listado por orden númerico`;
  } else if (phrase) {
    prompt = `Necesito que intentes adivinar la próxima palabra de esta frase "${phrase}". Dame una lista de cinco posibles palabras y ordénalas en orden de probabilidad, las más probables primero. Solo palabras existentes en el idioma español. Respondé solo con el listado. Si encontrás respondé solo con el listado por orden númerico`;
  }
  try {
    console.log("Consultando sugerencia a ChatGPT:", `"${prompt}"`);
    const chat_completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    const response = chat_completion.choices[0].message.content;
    console.log("Respuesta de ChatGPT:");
    console.log(response);
    res.json({ suggestions: response });
  } catch (error) {
    res.status(500).json({ suggestions: error });
    console.log("Error en la conexión con ChatGPT:", error);
  }
});

server.listen(port, () => {
  console.log(`Servidor andando en el puerto ${port}`);
});
