const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;
require("dotenv").config();
require("./db");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb", extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Server",
    status: 200
  });
});

app.use("/login", require("./routes/login"));
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/user"));
app.use("/projects", require("./routes/project"));
app.use("/teams", require("./routes/team"));

app.get("/download", function(req, res) {
  const { file } = req.query;

  if (!file) {
    res.status(400);
    return;
  }

  const script = `${__dirname}/script.js.txt`;
  const pages = `${__dirname}/pages.js.txt`;
  const config = `${__dirname}/config.js.txt`;

  const filesToDownload = { script, pages, config };

  res.download(filesToDownload[file]);
});

app.listen(port, () => console.log(`Running on port ${port} 🎉`));
