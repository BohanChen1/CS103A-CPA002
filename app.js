const createError = require("http-errors"); 
const express = require("express");
const path = require("path"); 
const cookieParser = require("cookie-parser"); 
const session = require("express-session"); 
const debug = require("debug")("personalapp:server");
const layouts = require("express-ejs-layouts");
const axios = require("axios");

const Diary = require("./models/Diary");

const mongoose = require("mongoose");
const mongodb_URI = "mongodb+srv://cbh534:QxddCgG1AxFFDtFe@cluster0.zofxv.mongodb.net/test"

mongoose.connect(mongodb_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("You successfully connect to the diary webapp");
});

const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(layouts);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "zzbbyanana789sdfa8f9ds8f90ds87f8d9s789fds", 
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/about", (req, res, next) => {
  res.render("about");
});

app.get(
  "/diary",
  async (req, res, next) => {
    try {
      let items = await Diary.find(); 
      res.locals.items = items; 
      res.render("diary"); 
    } catch (e) {
      next(e);
    }
  }
);

app.post("/diary/add", async (req, res, next) => {
  try {
    const { title, weather, content } = req.body; 
    const createdAt = new Date(); 
    let data = { title, content, weather, createdAt }; 
    let item = new Diary(data); 
    await item.save(); 
    res.redirect("/diary"); 
  } catch (e) {
    next(e);
  }
});

app.get("/diary/delete/:itemId", async (req, res, next) => {
  try {
    const itemId = req.params.itemId; 
    await Diary.deleteOne({ _id: itemId }); 
    res.redirect("/diary"); 
  } catch (e) {
    next(e);
  }
});

app.get(
  "/diary/show/:itemId",
  async (req, res, next) => {
    const { itemId } = req.params;
    const item = await Diary.findOne({ _id: itemId });
    res.locals.item = item;
    res.render("diarydetail");
  }
);


app.use(function (req, res, next) {
  next(createError(404));
});


app.use(function (err, req, res, next) {
  
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

process.env.PORT || "5000";
app.set("port", port);

const http = require("http");
const server = http.createServer(app);

server.listen(port);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;
