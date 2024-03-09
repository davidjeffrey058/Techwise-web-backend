const express = require("express");

const App = express();

App.get("/", (req, res) => {
  res.end("This is the message");
});

App.listen(3000, () => {
  console.log("listening at port 3000");
});
