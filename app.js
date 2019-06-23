const express = require("express"),
    bodyParser = require("body-parser"),
    crypto = require("crypto"),
    exec = require('child_process').exec,
    app = express(),
    config = require("./config.json");

process.send = process.send || function () {};

app.use(bodyParser.json());

app.post("/", (req, res) => {
    if (!req.body || !req.body.repository || !req.body.repository.full_name) {
        return res.status(422).json({
            error: "Ut oh, we haven't been given a valid payload to process this 'commit'."
        });
    } else {
        let repoName = req.body.repository.full_name;
        let configForRepo = config.repos[repoName];
        if (!configForRepo) {
            return res.status(422).json({
                error: "Oh, poo - the user hasn't yet configured this repo in their config.json. Come back later?!"
            });
        } else {
            if (configForRepo.secret) {
                let sig = "sha1=" + crypto.createHmac('sha1', configForRepo.secret).update(JSON.stringify(req.body)).digest('hex');
                if (req.get("X-Hub-Signature") != sig) {
                    return res.status(401).json({
                        error: "Invalid secret."
                    });
                }
            }
        }
        exec("git pull", {
            cwd: configForRepo.path
        }, (error, stdout) => {
            if (error) {
                return res.status(500).json({
                    error: "There was an error pulling the repo... That's a shame..."
                });
            } else {
                console.log("Updating repo", repoName, "\n", stdout, "\n");
                for (let i = 0; i < configForRepo.cmds.length; i++) {
                    let cmd = configForRepo.cmds[i];
                    exec(cmd, {
                        cwd: configForRepo.path
                    }, (error, stdout) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log(stdout);
                        }
                    });

                }
            }
        });
        return res.status(200).json({
            success: true,
            message: "Repo update handled! I think..."
        });
    }

});

app.listen(config.port || 8090, () => {
    console.log(`Auto-update listening on port ${config.port || 8090}!`);
    process.send('ready');
})
