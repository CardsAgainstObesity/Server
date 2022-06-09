import { createRequire } from "module";
import path from "path";
import https from 'https';
import express from 'express';
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
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

const openapi_options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Cards Against Obesity',
        version: '0.5.0',
      },
    },
    apis: ['./app.mjs'],
};

const app = express();

app.use("*", (req, res, next) => {
    // Log connections to the server
    const method = req.method;
    const ip = req.socket.remoteAddress;
    const path = req['_parsedUrl'].pathname;
    const userAgent = req.headers["user-agent"];

    LoggingSystem.singleton.log("[WEB]",`${method} | ${ip} | ${path} | ${userAgent}`);
    next();
});

const swaggerSpec = swaggerJSDoc(openapi_options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /helloworld:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
app.get('/helloworld', (req, res) => {
    res.send({ data: "Hello World!" });
});

/**
 * @openapi
 * /api/cardpack/{id}:
 *   get:
 *     summary: "Find cardpack by ID"
 *     description: "Returns a single cardpack"
 *     operationId: "get_cardpack_by_id"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of cardpack to return"
 *       required: true
 *       type: "string"
 *     responses:
 *       "200":
 *         description: "Successful operation"
 *       "404":
 *         description: "Cardpack not found"
 */
app.get("/api/cardpack/:id", (req, res) => {
    res.send(
        {
            data: {
                id: req.params.id
            }
        }
    );
});

app.use("/", expressStaticGzip(FRONTEND_DIST));

// Socket.IO admin panel
app.use("/", express.static("node_modules/@socket.io/admin-ui/ui/dist"));
app.use("/admin", (req, res) => {
    res.sendFile(path.resolve("node_modules/@socket.io/admin-ui/ui/dist/index.html"));
});

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