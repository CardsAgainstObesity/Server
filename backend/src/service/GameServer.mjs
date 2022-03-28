import { Server } from "socket.io";
import http from 'http';
import LoggingSystem from "../util/LoggingSystem.mjs";
import Room from "../entity/Room.mjs";
import Player from "../entity/Player.mjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const random_name = require("../../resources/random/names.json");

export default class GameServer {
    static __instance = null;

    /**
     * @returns {GameServer} Singleton instance of the GameServer
     */
    static get singleton() {
        if (GameServer.__instance == null) GameServer.__instance = new GameServer();
        return GameServer.__instance;
    }

    constructor() {
        this.__io = null;
        this.__rooms = new Map();
    }

    /**
     * @returns {Map<String,Room>} Returns existing rooms mapped by their identifiers
     */
    get rooms() {
        return this.__rooms;
    }

    /**
     * @returns {Server} Socket.IO ws server instance
     */
    get io() {
        if (this.__io == null) throw new Error("Socket.io ws server not started.");
        else return this.__io;
    }


    /**
     * Start the ws server and listen to http server
     * @param {http.Server} server The http sever the ws server is going to listen 
     */
    listen(server) {
        // Start the Socket.IO Server instance
        this.__io = new Server(server, {
            cors: {
                origin: "*", // TODO: CAMBIAR ESTO EN PRODUCCIÓN POR FAVOR
                methods: ["GET", "POST"]
            }
        });
        // Send log message
        const host = server.address().address + ":" + server.address().port;
        LoggingSystem.singleton.log("[" + this.constructor.name + "]", "Listening to: " + host);
        // Setup ws server events
        this.__setup();
    }

    /**
     * Socket.IO 'on' method wrapper.
     * @param {GameServerEvent} event 
     * @param {void} listener 
     */
    on(event, listener) {
        this.io.on(event, listener);
    }

    /**
     * Configures the events of the ws server
     * Shouldn't be called by hand. It will be
     * called along with listen.
     */
    __setup() {

        this.io.on("connection", (socket) => {

            // Create a player for the client
            let player = new Player(socket.id);
            // ----
            // Room creation
            // ----
            socket.on("RoomCreationRequest", (id) => {
                let roomId = id ? id.replace(" ", "").slice(0,10) : Date.now().toString(36).substr(2);
                LoggingSystem.singleton.log("[" + this.constructor.name + "]", "Created room: " + roomId);
                // Check if already room exists in the server
                let roomExists = this.rooms.has(roomId);
                if (!roomExists) {
                    let room = new Room(roomId, player);
                    // Add room to sever
                    this.rooms.set(roomId, room);
                    // Bind room events to server
                    this.__roomSetup(room);
                    // First make sure to leave every room
                    socket.rooms.forEach(room => {
                        socket.leave(room);
                    });
                    // Add socket to the sockets room
                    socket.join(roomId);
                    // Leave room if any
                    player.leaveRoom();
                    // Check if there is space in the room
                    if (room.players.size < room.maxPlayers) {
                        // Send room creation success reply
                        socket.emit("RoomCreationSuccess", room.toJSON());
                        // Join room
                        room.addPlayer(player);
                    } else {
                        // Send connection error reply
                        socket.emit("error", "RoomCapacityExceed");
                    }

                } else {
                    // Send creation error reply
                    socket.emit("error", "RoomAlreadyExists");
                }
            });


            // ---- 
            // Room connection
            // ----
            socket.on("RoomConnectionRequest", roomId => {
                // Check if room exists in the server
                let roomExists = this.rooms.has(roomId);
                if (roomExists) {
                    let room = this.rooms.get(roomId);
                    // First make sure to leave every room
                    socket.rooms.forEach(room => {
                        socket.leave(room);
                    });
                    // Add socket to the sockets room
                    socket.join(roomId);
                    // Leave room if any
                    player.leaveRoom();
                    // Check if there is space in the room
                    if (room.players.size < room.maxPlayers) {
                        // Send connection success reply
                        socket.emit("RoomConnectionSuccess", room.toJSON());
                        // Join room
                        room.addPlayer(player);
                    } else {
                        // Send connection error reply
                        socket.emit("error", "RoomCapacityExceed");
                    }
                } else {
                    // Send connection error reply
                    socket.emit("error", "UknownRoom");
                }
            });

            // ----
            // Name change
            // ----
            socket.on("RequestPlayerChangeName", (name) => {

                let newName;

                if(!name || name == "") {
                    // Get random name
                    newName = random_name[Math.floor(Math.random()*random_name.length)];
                } else {
                    newName = name.slice(0,25);
                }

                player.name = newName;
                if (player.room && player.room.status == "lobby") {
                    let roomId = player.room.id;
                    socket.to(roomId).emit("PlayerChangeName", player.toJSON());
                }
            });

            // ----
            // Add cardpack 
            // ----
            socket.on("LobbyAddCardpackRequest", (args) => {
                let player = args["emiter"];
                let cardpack_source = args["cardpack_source"];
                if((!player || !cardpack_source) || !(player instanceof Player)) {
                    socket.emit("error", "InvalidEventArgs");
                } else if(player.id != player.room.host.id) {
                    socket.emit("error", "NoPermissions");
                }else {
                    player.room.lobby
                    .addCardPack(cardpack_source)
                    .then(() => socket.emit("LobbyAddCardpackSuccess",pack.name))
                    .catch(() => socket.emit("error", "InvalidCardpack"));
                } 
            });
            // ----
            // Remove cardpack 
            // ----
            socket.on("LobbyRemoveCardpackRequest", (args) => {
                let player = args["emiter"];
                let cardpack_name = args["cardpack_name"];
                if((!player || !cardpack_name) || !(player instanceof Player)) {
                    socket.emit("error", "InvalidEventArgs");
                } else if(player.id != player.room.host.id) {
                    socket.emit("error", "NoPermissions");
                }else {
                    if(player.room) {
                        player.room.lobby
                        .removeCardPack(cardpack_name);
                    } else {
                        socket.emit("error","PlayerNotInARoom");
                    }
                }
            });
            // ----
            // Start the game
            // ----
            socket.on("RoomStartRequest", (emiter) => {
                let player = args["emiter"];
                if(!player || !(player instanceof Player)) {
                    socket.emit("error", "InvalidEventArgs");
                } else if(player.id != player.room.host.id) {
                    socket.emit("error", "NoPermissions");
                } else {
                    if(player.room) {
                        player.room.start();
                    } else {
                        socket.emit("error","PlayerNotInARoom");
                    }
                }
            });

            // ----
            // Socket disconnected
            // ----
            socket.on("disconnect", (socket) => {
                player.leaveRoom();
            });

        });

    }

    /**
     * Binds the room events to the 
     * server
     * @param {Room} room - Room to link
     */
    __roomSetup(room) {
        let roomId = room.roomId;
        let roomCh = this.io.to(roomId);

        room.on("RoomStatusChanged", (status) => {
            roomCh.emit("RoomStatusChanged", status);
        });

        room.on("RoomCzarChanged", (playerJSON) => {
            roomCh.emit("RoomCzarChanged", playerJSON);
        });

        room.on("RoomPlayerConnection", (playerJSON) => {
            roomCh.emit("RoomPlayerConnection", playerJSON);
        });

        room.on("RoomPlayerDisconnection", (playerJSON) => {

            // If the room is empty, delete it
            if (room.players.size == 0) {
                room.remove();
            }

            roomCh.emit("RoomPlayerDisconnection", playerJSON);
        });

        room.on("RoomRemoved", (roomJSON) => {
            LoggingSystem.singleton.log("[" + this.constructor.name + "]","Room deleted: " + roomJSON.roomId);
            roomCh.emit("RoomRemoved", roomJSON);
            this.rooms.delete(roomId);
            this.io.of("/").adapter.on(roomId).disconnectSockets();
        });

        room.on("RoomStart", () => {
            LoggingSystem.singleton.log("[" + this.constructor.name + "]","Room started: " + roomJSON.roomId);
            roomCh.emit("RoomStart");
        });

    }
}