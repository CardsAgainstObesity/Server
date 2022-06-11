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
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";


const FRONTEND_DIST = path.resolve(process.env.FRONTEND_DIST);
const SOCKETIO_DIST = "node_modules/@socket.io/admin-ui/ui/dist";

// Print server information
LoggingSystem.singleton.log("[APP]", "Logging path: " + LoggingSystem.singleton._loggingPath);
LoggingSystem.singleton.log("[APP]", "Replays path: " + path.resolve(process.env.REPLAYS_PATH));
LoggingSystem.singleton.log("[APP]", `Socket.io admin panel (/admin) is ${process.env.SOCKETIO_ADMIN_UI_ENABLED == "true" ? "enabled" : "disabled"}`);

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
            version: '0.5.1',
        },
    },
    apis: ['./app.mjs'],
};

const swagger_options = {
    customCss: `
        .swagger-ui .topbar {
            display: none;
        }

        body {
            background-color: #181818;
        }

        *:not(.opblock-summary-method, .btn.execute, .download-contents, pre, input, code, code > *, pre.microlight > *) {
            color: #a2a2a2 !important;
            fill: #a2a2a2;
        }

        .swagger-ui .opblock .opblock-section-header {
            background: #222222;
        }
        `,
};

const app = express();

// Logger
app.use("*", (req, res, next) => {
    // Log connections to the server
    const method = req.method;
    const ip = req.socket.remoteAddress;
    const path = req['_parsedUrl'].pathname;
    const userAgent = req.headers["user-agent"];

    LoggingSystem.singleton.log("[WEB]", `${method} | ${ip} | ${path} | ${userAgent}`);
    next();
});

const rateLimiter = new RateLimiterMemory(
    {
        points: 3,
        duration: 5
    }
);

const swaggerSpec = swaggerJSDoc(openapi_options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swagger_options));

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
 *       "500":
 *         description: "Internal error"
 *       "429":
 *         description: "Too many requests"
 * 
 */
app.get("/api/cardpack/:id", async (req, res) => {
    try {
        await rateLimiter.consume(req.ip); // consume 1 point per event from IP
        const id = req.params.id;
        const cardpack = Cardpack.getCardpack(id);
        res.status(cardpack == undefined ? 404 : 200);
        res.send({
            error: cardpack == undefined,
            data: cardpack != undefined ? cardpack : "Invalid cardpack"
        });
    } catch (err) {
        if (err instanceof RateLimiterRes) {
            res.status(429)
            res.send({
                error: true,
                data: "Rate limited"
            });
        } else {
            res.status(500);
            res.send({ error: true, data: "failed" });
            LoggingSystem.singleton.log("[API(/cardpack/:id)]", `Error: ${err}`);
        }
    }
});

/**
 * @openapi
 * /api/cardpacks:
 *   get:
 *     summary: "Get every cardpack's ID"
 *     description: "Returns an array with the cardpack's IDs"
 *     operationId: "get_cardpacks"
 *     produces:
 *     - "application/json"
 *     responses:
 *       "200":
 *         description: "Successful operation"
 *       "500":
 *         description: "Internal error"
 *       "429":
 *         description: "Too many requests"
 */
app.get("/api/cardpacks", async (req, res) => {
    try {
        await rateLimiter.consume(req.ip); // consume 1 point per event from IP
        const cardpacks = {};
        Object.keys(Cardpack.cardpacks).forEach(cardpack => {
            cardpacks[cardpack] = Cardpack.cardpacks[cardpack].pack_info;
        });
        res.send({
            error: false,
            data: cardpacks
        });
    } catch (err) {
        res.status(429);
        if (err instanceof RateLimiterRes) {
            res.send({
                error: true,
                data: "Rate limited"
            });
        } else {
            res.status(500)
            res.send({ error: true, data: "failed" });
            LoggingSystem.singleton.log("[API(/cardpacks)]", `Error: ${err}`);
        }
    }
});

/**
 * @openapi
 * /api/rooms:
 *   get:
 *     summary: "Get available rooms"
 *     description: "Returns the list of available rooms"
 *     operationId: "get_rooms"
 *     produces:
 *     - "application/json"
 *     responses:
 *       "200":
 *         description: "Successful operation"
 *       "429":
 *         description: "Too many requests"
 *       "500":
 *         description: "Internal error"
 */
app.get("/api/rooms", async (req, res) => {
    try {
        await rateLimiter.consume(req.ip); // consume 1 point per event from IP
        const rooms = {};
        GameServer.singleton.rooms.forEach(room => {
            rooms[room.roomId] = room.toJSONSimplified();
        });
        res.send({
            error: false,
            data: rooms
        });
    } catch (err) {
        res.status(429);
        if (err instanceof RateLimiterRes) {
            res.send({
                error: true,
                data: "Rate limited"
            });
        } else {
            res.send({ error: true, data: "failed" });
            LoggingSystem.singleton.log("[API(/rooms)]", `Error: ${err}`);
        }
    }
});

// Static
app.use("/", expressStaticGzip(FRONTEND_DIST, { enableBrotli: true, orderPreference: ['br', 'gzip'] }));
app.get("/service-worker.js", (req, res) => {
    res.sendFile(`${FRONTEND_DIST}/service-worker.js`);
});

// Socket.IO Admin UI
if (process.env.SOCKETIO_ADMIN_UI_ENABLED === "true") {
    app.use("/", express.static(SOCKETIO_DIST));
    app.use("/admin", (req, res) => {
        res.sendFile(path.resolve(`${SOCKETIO_DIST}/index.html`));
    });
}

// Let Vue handle 404s
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
            GameServer.singleton.listen(secure_server);
        })
        .catch(err => { throw err; });
});

secure_server.on("error", err => {
    throw err;
});
