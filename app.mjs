import { createRequire } from "module";
import http2 from 'http2';
import { readFileSync } from 'fs';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import GameServer from './src/service/GameServer.mjs';
import 'dotenv/config';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';

const require = createRequire(import.meta.url);
const config = require("./config.json");

let serve = serveStatic(process.env.FRONTEND_PATH + '/dist', { index: 'index.html', fallthrough: false })

// HTTP Server configuration
const options = { // TODO: Set values in config.json
    key: readFileSync('src/openssl/key.pem'),
    cert: readFileSync('src/openssl/cert.pem'),
    passphrase: 'abcd',
    allowHTTP1: true
}

// Create server
let server = http2.createSecureServer(options, onRequest);

function onRequest(req, res) { // HTTP/1.1 Syntax
    let done = finalhandler(req, res);
    serve(req, res, (err) => {
        if (err) return res.end(readFileSync(process.env.FRONTEND_PATH + '/dist/index.html')); // Redirect non matching URLs to index.html
        return done();
    });
}

// Start listening for requests on configured port
server.listen(config.secure_port, () => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);
});

// Link GameServer to HTTP/2 server
GameServer.singleton.listen(server);