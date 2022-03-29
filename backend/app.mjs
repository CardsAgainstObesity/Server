import express from 'express';
import { createRequire } from "module";
import http from 'http';
import https from 'https';
import path from 'path';
import { readFileSync } from 'fs';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import GameServer from './src/service/GameServer.mjs';

const require = createRequire(import.meta.url);
const config = require("./config.json");

const app = express();
app.use(express.static(path.resolve('../frontend/dist')));

// HTTP Server instance
const options = {
    key: readFileSync('src/openssl/key.pem'),
    cert: readFileSync('src/openssl/cert.pem'),
    passphrase: 'abcd',
}
const server = https.createServer(options, app);

// Start listening for requests on configured port
server.listen(config.secure_port, () => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);
});

// Link GameServer to HTTP server
GameServer.singleton.listen(server);