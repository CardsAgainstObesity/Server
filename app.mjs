import { createRequire } from "module";
import https from 'https';
import express from 'express';
import expressStaticGzip from "express-static-gzip";
import { readFileSync } from 'fs';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import GameServer from './src/service/GameServer.mjs';
import 'dotenv/config';
import { Cardpack } from "./src/entity/Cardpack.mjs";

const require = createRequire(import.meta.url);
const config = require("./config.json");
const FRONTEND_DIST = `${process.env.FRONTEND_PATH}/dist`;

// HTTP Server configuration
const options = { // TODO: Set values in config.json
    key: readFileSync('src/openssl/key.pem'),
    cert: readFileSync('src/openssl/cert.pem'),
    passphrase: 'abcd',
}

const app = express();

app.use("*", (req, res, next) => {
    // Log connections to the server
    const ip = req.socket.remoteAddress;
    const path = req['_parsedUrl'].pathname;
    const userAgent = req.headers["user-agent"];

    LoggingSystem.singleton.log("[WEB]",`${ip} ${path} ${userAgent}`);
    next();
});

app.use("/", expressStaticGzip(FRONTEND_DIST));
app.get("*", (req, res) => {
    res.sendFile(`${FRONTEND_DIST}/index.html`);
});

let server = https.createServer(options, app);

// Start listening for requests on configured port
server.listen(config.secure_port, () => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);
});

// Link GameServer to HTTP/1.1 server
// TODO: Redirect HTTP to HTTPs
GameServer.singleton.listen(server);