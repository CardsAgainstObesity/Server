import express from 'express';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import { createRequire } from "module";
import WSServer from './src/ws/WSServer.mjs';
import Game from './src/game/Game.mjs';
import ErrorResponse from './src/util/ErrorResponse.mjs';
import http from 'http';
import path from 'path';
import Player from './src/player/Player.mjs';

const require = createRequire(
    import.meta.url);

const config = require("./config.json");
const random_names = require("./resources/random/names.json");
const game = Game.singleton;

const app = express();
app.use(express.static(path.resolve('../frontend/dist')));

// Server instance
const server = http.createServer(app);

/*         Express         */

app.get("/api/room/exists/:roomId", (req, res) => {
    let roomId = req.params.roomId;
    res.send({ "exists": game.rooms.has(roomId) });
});

app.get("/api/room/players/:roomId", (req, res) => {
    let roomId = req.params.roomId;
    if (game.rooms.has(roomId)) {
        let players = Array.from(game.rooms.get(roomId).players.values()).map(value => value.toJSON());
        console.log(players);
        res.send(players);
    } else {
        res.send(new ErrorResponse("UknownRoom").toJSON());
    }
});

app.get("/api/room/czar/:roomId", (req, res) => {
    let roomId = req.params.roomId;
    if (game.rooms.has(roomId)) {
        let czar = game.rooms.get(roomId).czar;
        res.send(czar);
    } else {
        res.send(new ErrorResponse("UknownRoom").toJSON());
    }
});

// Start listening for requests on configured port
server.listen(config.port, () => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB] Listening to " + host);
});
/*         WS         */

// Start listening for WS connections on configured port
WSServer.listen(server, (server) => {

    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WSServer] Listening to " + host);


    // Namespace used for sockets connecting to the server
    const namespace = WSServer.io.of("/ws");

    // Listen for connections
    WSServer.io.on("connection", (socket) => {
        console.log("Socket connected: " + socket.id);
        // Create a player entity which will with the socket
        let player = new Player(socket);
        // Client has requested to join a room
        socket.on("roomJoinRequest", (roomId) => {
            if (!game.rooms.has(roomId)) { // If room doesn't exist, then send an error
                socket.emit("error", new ErrorResponse("UknownRoom").toJSON());
                game.createRoom(roomId,player,15,7);
            } else if(game.rooms.get(roomId)._deleted) {
                socket.emit("error", new ErrorResponse("RoomDeleted").toJSON());
            } else {
                // If room exists then send a roomConnectionSuccess message
                let room = game.rooms.get(roomId);
                if (room.addPlayer(player)) {
                    LoggingSystem.singleton.log("[Game] Adding Player(" + player.id + ") to Room(" + room.id + ")");
                    socket.join(room.id); // make the client join the sockets room ( for better management of game rooms )
                    socket.emit("RoomConnectionSuccess", room.toJSON()); // Tell the socket that the connection to the room was successful
                    socket.to(room.id).emit("PlayerConnected",player.toJSON()); // Send a broadcast (excluding the socket) to the room anouncing a new player
                }
            }
        });

        socket.on("RequestPlayerChangeName", (newName) => {
            let crispyChickenName = random_names[Math.floor(Math.random () * random_names.length)];
            player.name = newName || crispyChickenName;
            //if(player.room) {
                //socket.to(player.room.id).emit("PlayerChangeName",{"player":player.id, "name":newName});
            //}
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            let room = player.room;
            if (room) {
                room.removePlayer(player);
            }
        });
    });

});