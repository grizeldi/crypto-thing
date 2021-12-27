const express = require("express");
const app = express();
const PORT = 5000;

app.use(express.static("frontend"));
app.use(express.static("node_modules/jquery/dist"));

console.log("Listening on port: " + PORT);
app.listen(PORT);