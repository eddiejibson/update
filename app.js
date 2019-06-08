const express = require("express"),
    bodyParser = require('body-parser'),
    app = express(),
    config = require("./config.json");

app.use(bodyParser.json());

app.post("/", (req, res) => {
    let repoName = req.body.repository.full_name;
    console.log("REPO name is", repoName);
    let configForRepo = config.repos[repoName];
});

app.listen(config.port || 8090, () => console.log(`Auto-update listening on port ${config.port || 8090}!`))