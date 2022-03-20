import express from 'express';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import { createRequire } from "module";
import WSServer from './src/ws/WSServer.mjs';
import Game from './src/game/Game.mjs';
import ErrorResponse from './src/util/ErrorResponse.mjs';
import http from 'http';
import cors from 'cors';

const require = createRequire(
    import.meta.url);

const config = require("./config.json");
const game = Game.singleton;


const app = express();

// Server instance
const server = http.createServer(app);

/*         API (read-only)         */

app.get("/room/exists/:roomId", (req, res) => {
    let roomId = req.params.roomId;
    res.send({ "exists": game.rooms.has(roomId) });
});

// Start listening for API requests on configured port
server.listen(config.api.port, () => {
    LoggingSystem.singleton.log("[API] Listening to " + config.api.port);
});

/*         WS         */


// Start listening for WS connections on configured port
WSServer.listen(server, (port) => {

    LoggingSystem.singleton.log("[WSServer] Listening to " + port);


    // Namespace used for sockets connecting to the server
    const namespace = WSServer.io.of("/ws");

    // Listen for connections
    WSServer.io.on("connection", (socket) => {
        console.log("Socket connected: " + socket.id);
        // Client has requested to join a room
        socket.on("roomJoinRequest", (roomId) => {
            console.log(roomId);
            if (!game.rooms.has(roomId)) { // If room doesn't exist, then send an error
                socket.emit("error", new ErrorResponse("UknownRoom").toJSON());
            } else { // If room exists then send a roomConnectionSuccess message
                let room = game.rooms.get(roomId);
                console.log(game.rooms.has(roomId))
                socket.emit("roomConnectionSuccess", room.toJSON());
            }
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected")
        });
    });

});