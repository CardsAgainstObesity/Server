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
const secure_server = false;

const app = express();
app.use(express.static(path.resolve('../frontend/dist')));

app.get('*', function (req, res) { // Redirect all URLs to VueJS
    res.sendFile(path.resolve('../frontend/dist/index.html'));
});
    
// HTTP Server instance
const options = {
    key: readFileSync('src/openssl/key.pem'),
    cert: readFileSync('src/openssl/cert.pem'),
    passphrase: 'abcd',
}
let server;
if (secure_server) server = https.createServer(options, app);
else server = http.createServer(app);

// Start listening for requests on configured port
server.listen(secure_server ? config.secure_port:config.port, () => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);
});

// Link GameServer to HTTP server
GameServer.singleton.listen(server);