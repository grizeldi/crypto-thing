const express = require("express");
const app = express();
const PORT = process.env.PORT;

app.use(express.static("frontend"));
// Frontend dependencies that are installed via npm
app.use(express.static("node_modules/jquery/dist"));
app.use(express.static("node_modules/web3/dist"));

console.log("Listening on port: " + PORT);
app.listen(PORT);