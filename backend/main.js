const express = require("express");
const app = express();
const fs = require("fs");
const exec = require("await-exec");

const PORT = process.env.PORT;
const CONFIG_LOCATION = "config/";
const CONFIG_FILENAME = "chainconfig.json"

async function start() {
    // Load config and run setup.js if it's not found
    if (!fs.existsSync(CONFIG_LOCATION + CONFIG_FILENAME)) {
        console.log("Environment is not configured, running setup script.");
        await exec("npm run setup").then((sout, serr) => {if (sout) console.log(sout.stdout)});
    }

    app.use(express.static("frontend"));
    // Frontend dependencies that are installed via npm
    app.use(express.static("node_modules/jquery/dist"));
    app.use(express.static("node_modules/web3/dist"));
    app.use(express.static(CONFIG_LOCATION));

    console.log("Listening on port: " + PORT);
    app.listen(PORT);
}
start();