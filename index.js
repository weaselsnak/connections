const express = require("express");
const app = express();
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", async (req, res) => {
  const currentDate = new Date();
  const url = `https://www.nytimes.com/svc/connections/v2/${currentDate.toLocaleDateString("sv", {timeZone:'Australia/Sydney'})}.json`
  console.log(`fetching ${url}`);
  const json = await (await fetch(url)).json();
  const words = json.categories.flatMap(({ cards }) => cards);
  words.sort((a, b) => a.position - b.position);
  res.render("index", { words, categories: json.categories });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("solved", (msg) => {
    socket.broadcast.emit("solution", msg);
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});
