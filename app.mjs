import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import expressStaticGzip from "express-static-gzip";
import LoggingSystem from "./src/util/LoggingSystem.mjs";
import GameServer from "./src/service/GameServer.mjs";
import dotenv from "dotenv";
dotenv.config({ encoding: "ascii", override: true });
import { Cardpack } from "./src/entity/Cardpack.mjs";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";


const FRONTEND_DIST = path.resolve(process.env.FRONTEND_DIST);
const SOCKETIO_DIST = "node_modules/@socket.io/admin-ui/ui/dist";

// Print server information
LoggingSystem.singleton.log("[APP]", "Logging path: " + LoggingSystem.singleton._loggingPath);
LoggingSystem.singleton.log("[APP]", "Replays path: " + path.resolve(process.env.REPLAYS_PATH));
LoggingSystem.singleton.log("[APP]", `Socket.io admin panel (/admin) is ${process.env.SOCKETIO_ADMIN_UI_ENABLED == "true" ? "enabled" : "disabled"}`);

const openapi_options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Cards Against Obesity",
            version: "0.5.2",
        },
    },
    apis: ["./app.mjs"],
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

const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

// Logger
app.use("*", (req, res, next) => {
    // Log connections to the server
    const method = req.method;
    const ip = req.headers["x-forwarded-for"].split(",")[0];
    // req.headers["x-forwarded-for"].split(",").forEach(value => console.log(`ip: "${value}"`));
    const protocol = req.headers["x-forwarded-proto"].split(",")[0];
    const path = req['_parsedUrl'].pathname;
    const userAgent = req.headers["user-agent"];

    LoggingSystem.singleton.log("[WEB]", `${method} | ${ip} | ${protocol} | ${path} | ${userAgent}`);
    next();
});

app.use("*", (req, res, next) => { // Redirect HTTP to HTTPs
    const protocol = req.headers["x-forwarded-proto"].split(",")[0];
    if (protocol === "http") {
        res.redirect(`https://${req.headers.host}${req['_parsedUrl'].pathname}`);
    } else next();
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

// Secure
const server = http.createServer(app);
server.listen(process.env.PORT, (e) => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);

    // Load cardpacks
    Cardpack.__load()
        .then(() => {
            // Link GameServer to HTTP/1.1 server
            GameServer.singleton.listen(server);
        })
        .catch(err => { throw err; });
});

server.on("error", err => {
    throw err;
});
