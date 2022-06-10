import path from "path";
import http from 'http';
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
import { exit } from "process";

const FRONTEND_DIST = `${process.env.FRONTEND_PATH}/dist`;
const SOCKETIO_DIST = "node_modules/@socket.io/admin-ui/ui/dist";

// HTTPs Server configuration
const options = { // TODO: Set values in .env
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

    LoggingSystem.singleton.log("[WEB]", `${method} | ${ip} | ${path} | ${userAgent}`);
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
    const id = req.params.id;
    Cardpack
        .from(id)
        .then(cardpack => {
            res.send(
                {
                    data: cardpack
                }
            );
        })
        .catch(err => {
            res.send(
                {
                    data: err
                }
            )
        })
});

app.use("/", expressStaticGzip(FRONTEND_DIST));

if (process.env.SOCKETIO_ADMIN_UI_ENABLED === "true") { // Socket.IO Admin UI
    app.use("/", express.static(SOCKETIO_DIST));
    app.use("/admin", (req, res) => {
        res.sendFile(path.resolve(`${SOCKETIO_DIST}/index.html`));
    });
}

app.get("*", (req, res) => {
    res.sendFile(`${FRONTEND_DIST}/index.html`);
});

// Insecure
const insecure_app = express();
insecure_app.use("*", (req, res) => {
    res.redirect(`https://${req.headers.host.replace(`:${process.env.PORT}`, "")}:${process.env.SECURE_PORT}${req.url}`);
});
const insecure_server = http.createServer(insecure_app);
insecure_server.listen(process.env.PORT);
insecure_server.on("error", err => {
    throw err;
});

// Secure
const secure_server = https.createServer(options, app);
secure_server.listen(process.env.SECURE_PORT, (e) => {
    let host = secure_server.address().address + ":" + secure_server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);

    // Load cardpacks
    Cardpack.__load()
    .then(() => {
        // Link GameServer to HTTP/1.1 server
        // TODO: Redirect HTTP to HTTPs
        GameServer.singleton.listen(secure_server);
    })
    .catch(err => {throw err;});
});
secure_server.on("error", err => {
    throw err;
});

