import http from 'http';
import { createRequire } from "module";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import Player from "../entity/Player.mjs";
import Room from "../entity/Room.mjs";
import LoggingSystem from "../util/LoggingSystem.mjs";
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { Cardpack } from '../entity/Cardpack.mjs';

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
                methods: ["GET", "POST"],
            }
        });

        if (process.env.SOCKETIO_ADMIN_UI_ENABLED === "true") { // Socket.IO Admin UI
            instrument(this.__io, {
                namespaceName: "/admin", // Hay que poner en Server URL esto (es muy importante el "/admin"): https://SERVERHOST:8443/admin
                auth: {
                    type: "basic",
                    username: process.env.SOCKETIO_ADMIN_UI_USER,
                    password: process.env.SOCKETIO_ADMIN_UI_PASSWORD,
                }
            });
        }
        

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

        // Setup rate-limit
        const rateLimiter = new RateLimiterMemory(
            {
                points: 5,
                duration: 2
            }
        );


        this.io.on("connection", (socket) => {

            // Create a player for the client
            let player = new Player(socket.id);

            // ----
            // Room creation
            // ----
            socket.on("RoomCreationRequest", async (id, password) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP
                    let roomId = id ? id.replace(" ", "").slice(0, 10) : Date.now().toString(36).substr(2);
                    // Check if already room exists in the server
                    let roomExists = this.rooms.has(roomId);
                    if (!roomExists) {
                        const privateRoom = password && password.length > 0;
                        let room = new Room(roomId, player, privateRoom, password);
                        // Add room to sever
                        this.rooms.set(roomId, room);
                        // Bind room events to server
                        this.__roomSetup(room);
                        // Log the creation of the room
                        LoggingSystem.singleton.log("[" + this.constructor.name + "]", `Created a ${room.privateRoom ? "private" : "public"} room: ${roomId}`);
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

                } catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });


            // ---- 
            // Room connection
            // ----
            socket.on("RoomConnectionRequest", async (roomId, password) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    // Check if room exists in the server
                    let roomExists = this.rooms.has(roomId);
                    if (roomExists) {
                        let room = this.rooms.get(roomId);
                        // First make sure to leave every room
                        socket.rooms.forEach(room => {
                            socket.leave(room);
                        });
                        if(room.privateRoom)
                        {
                            if(room.password != password) throw new Error("InvalidPassword")
                        }
                        // Add socket to the sockets room
                        socket.join(roomId);
                        // Leave room if any
                        player.leaveRoom();
                        // Check if there is space in the room
                        if (room.players.size < room.maxPlayers) {

                            // If they are in the lobby then you can join
                            if(room.status == "lobby")
                            {
                                // Send connection success reply
                                socket.emit("RoomConnectionSuccess", room.toJSON());
                                // Join room
                                room.addPlayer(player);
                            } else { // The room is not in the lobby anymore, ask the czar for permission
                                let hostId = room.host.id;
                                let host = this.io.of("/").sockets.get(hostId);
                                host.emit("RoomConnectionRequestPrompt", (answer) => {
                                    console.log(answer);
                                    if(answer) {
                                        socket.emit("RoomConnectionSuccess", room.toJSON());
                                        room.addPlayer(player);
                                        room.dealCardsPlayer(player,room,true);
                                    }
                                    else socket.emit("RoomConnectionDenied");
                                });
                            }

                        } else {
                            // Send connection error reply
                            socket.emit("error", "RoomCapacityExceed");
                        }
                    } else {
                        // Send connection error reply
                        socket.emit("error", "UnknownRoom");
                    }
                } catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        if(err.message && err.message == "InvalidPassword") socket.emit("error", "InvalidPassword");
                        else console.error(err);
                    }
                } 
            });

            // ----
            // Name change
            // ----
            socket.on("RequestPlayerChangeName",async (name) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP


                    let newName;

                    if (!name || name == "") {
                        // Get random name
                        newName = random_name[Math.floor(Math.random() * random_name.length)];
                    } else {
                        newName = name.slice(0, 25);
                    }

                    player.name = newName;
                    if (player.room && player.room.status == "lobby") {
                        let roomId = player.room.roomId;
                        socket.to(roomId).emit("PlayerChangeName", player.toJSONSimplified());
                    }

                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Add cardpack 
            // ----
            socket.on("LobbyAddCardpackRequest",async (args) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP


                    let emiter_id = socket.id;
                    let cardpack_id = args["cardpack_id"];
                    //let room_id = args["room_id"];
                    let room = player.room; // this.rooms.get(room_id);
                    if (!room || !(room instanceof Room)) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else {
                        let emiter = room.players.get(emiter_id);
                        if ((!emiter || !cardpack_id) || !(emiter instanceof Player)) {
                            socket.emit("error", "InvalidEventArgs");
                        } else if (emiter.id != emiter.room.host.id) {
                            socket.emit("error", "NoPermissions");
                        } else {
                            emiter.room.addCardPack(cardpack_id)
                                .then(cardpack => {
                                    if (!cardpack) socket.emit("error", "InvalidCardpack");
                                })
                                .catch(() => {
                                    socket.emit("error", "CardpackAlreadyAdded");
                                });
                        }
                    }
                } catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });
            // ----
            // Remove cardpack 
            // ----
            socket.on("LobbyRemoveCardpackRequest",async (args) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP


                    let emiter_id = socket.id;
                    let cardpack_id = args["cardpack_id"];
                    // let room_id = args["room_id"];
                    let room = player.room; // this.rooms.get(room_id);
                    if (!room || !(room instanceof Room)) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else {
                        let emiter = room.players.get(emiter_id);
                        if ((!emiter || !cardpack_id) || !(emiter instanceof Player)) {
                            socket.emit("error", "InvalidEventArgs");
                        } else if (emiter.id != emiter.room.host.id) {
                            socket.emit("error", "NoPermissions");
                        } else {
                            if (emiter.room) {
                                if (!emiter.room.removeCardPack(cardpack_id)) {
                                    socket.emit("error", "CardpackNotRemoved");
                                }
                            }
                        }
                    }
                } catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });
            // ----
            // Start the game
            // ----
            socket.on("RoomStartRequest",async (room_id) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    let emiter_id = socket.id;
                    let room = player.room; // this.rooms.get(room_id);
                    if (!room || !(room instanceof Room)) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else {
                        let emiter = room.players.get(emiter_id);
                        if (!emiter || !(emiter instanceof Player)) {
                            socket.emit("error", "InvalidEventArgs");
                        } else if (emiter.id != emiter.room.host.id) {
                            socket.emit("error", "NoPermissions");
                        } else {
                            if (emiter.room) {
                                room.start()
                                    .then(error => {
                                        if (error) {
                                            socket.emit("error", error);
                                        }
                                    });
                            }
                        }
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Player is ready ( prepare selected cards )
            // ----
            socket.on("PlayerIsReady",async (card_ids) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    if (!player.ready) {
                        let err = false;
                        let room = player.room;
                        if (room && room.blackCard) {
                            player.selectedCards.length = 0;
                            // TODO : Clear code
                            if(player.id == room.czar.id) return;

                            let bCard = room.blackCard;
                            if (card_ids.length == bCard.slots) {
                                for (let i = 0, len = card_ids.length; i < len && !err; i++) {
                                    let id = card_ids[i];
                                    if (!player.deck.has(id)) {
                                        socket.emit("error", "PlayerDoesntOwnThatCard");
                                        err = true;
                                    }
                                    else {
                                        player.selectedCards.push(player.deck.get(id)); // This reverses the insertion order.
                                    }
                                }
                                player.selectedCards.reverse(); // And this fixes it.

                                if (!err) {
                                    room.playerReady(player);
                                    // socket.to(room.roomId).emit("AnnouncePlayerIsReady", player.toJSON());
                                }
                                else {
                                    player.selectedCards.length = 0;
                                }
                            }
                            else {
                                socket.emit("error", "InvalidAmountOfSelectedCards");
                            }
                        } else {
                            socket.emit("error", "PlayerNotInARoom");
                        }
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Player is not ready
            // ----
            socket.on("PlayerIsNotReady",async () => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    let room = player.room;
                    if (room && room.blackCard) {
                        room.playerNotReady(player);
                        // socket.to(room.roomId).emit("AnnouncePlayerIsNotReady", player.toJSON())
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Czar wants to start voting ( all players must be ready ) 
            // ----
            socket.on("RoomStartVotingRequest",async (room_id) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    let emiter_id = socket.id;
                    let room = player.room; // this.rooms.get(room_id);
                    if (!room || !(room instanceof Room)) {
                        socket.emit("error", "InvalidEventArgs");
                    } else {
                        let emiter = room.players.get(emiter_id);
                        if (!emiter || !(emiter instanceof Player)) {
                            socket.emit("error", "InvalidEventArgs");
                        } else if (emiter.id != emiter.room.czar.id) {
                            socket.emit("error", "NoPermissions");
                        } else {
                            if (!emiter.room) {
                                socket.emit("error", "PlayerNotInARoom");
                            } else {

                                let allReady = true;
                                for (let player of emiter.room.players.values()) {
                                    if (!player.ready && (room.czar.id != player.id)) { allReady = false; break; }
                                }

                                if (!allReady) {
                                    socket.emit("error", "PlayersNotReady");
                                } else {
                                    // Remove selected cards from player's decks
                                    room.startVoting();
                                }
                            }
                        }
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Czar selected winner 
            // ----
            socket.on("RoomSelectWinnerRequest",async (player_id) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    let room = player.room;
                    if (!room) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else if (player.id != room.czar.id) {
                        socket.emit("error", "NoPermissions");
                    } else {
                        let pWinner = room.players.get(player_id);
                        if (!pWinner) {
                            socket.emit("error", "InvalidEventArgs");
                        } else if(room.czar.id == pWinner.id) {
                            socket.emit("error", "CantSelectCzarAsWinner");
                        } else {
                            room.selectWinner(player_id);
                        }
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Czar request players to go back to choosing screen
            // ----
            socket.on("RoomStartChoosingRequest", async () => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    let room = player.room;
                    if (!room) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else if (player.id != room.czar.id) {
                        socket.emit("error", "NoPermissions");
                    } else {
                        room.backToChoosing();
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // After the game ended, the last Czar can send players to lobby
            // ----
            socket.on("RoomGoBackToLobbyRequest",async () => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    let room = player.room;
                    if (!room) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else if (player.id != room.czar.id) {
                        socket.emit("error", "NoPermissions");
                    } else {
                        room.backToLobby();
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
                    }
                }
            });

            // ----
            // Czar fliped a card
            // ----
            socket.on("RoomFlipCardRequest",async (player_id) => {
                try {
                    await rateLimiter.consume(socket.handshake.address); // consume 1 point per event from IP

                    if (player.room && player.room.status == "voting") {
                        if (player.id == player.room.czar.id) {
                            socket.to(player.room.roomId).emit("RoomFlipCard", player_id);
                        } else {
                            socket.emit("error", "NoPermissions");
                        }
                    }
                }
                catch (err) {
                    if (err instanceof RateLimiterRes) {
                        // User being ratelimited ( by IP )
                        socket.emit("RateLimited", { 'retry': err.msBeforeNext });
                    } else {
                        console.error(err);
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
            } else if (room.players.size < room.minPlayers) {
                room.remove();
            } else {
                // If the player is the czar, change the czar
                room.rotateCzar();
                const czar = room.czar;
                // Give selected cards back to the player
                for(var card of czar.selectedCards) {
                    console.log(card);
                    czar.deck.set(card.id,card);
                }
                room.playerNotReady(czar);
            }

            roomCh.emit("RoomPlayerDisconnection", playerJSON);
        });

        room.on("LobbyAddCardpackSuccess", (pack_info) => {
            roomCh.emit("LobbyAddCardpackSuccess", pack_info);
        });

        room.on("LobbyRemoveCardpackSuccess", (cardpack_id) => {
            roomCh.emit("LobbyRemoveCardpackSuccess", cardpack_id);
        });

        room.on("RoomRemoved", (roomJSON) => {
            LoggingSystem.singleton.log("[" + this.constructor.name + "]", "Room deleted: " + roomJSON.roomId);
            roomCh.emit("RoomRemoved", roomJSON);
            this.rooms.delete(roomId);
            this.io.of("/").in(roomId).disconnectSockets();
        });

        room.on("RoomStart", (roomJSON) => {
            LoggingSystem.singleton.log("[" + this.constructor.name + "]", "Room started: " + roomJSON.roomId);
            roomCh.emit("RoomStart", roomJSON);
        });

        room.on("error", (error) => {
            roomCh.emit("error", error);
        });

        room.on("RoomCardsDealed", () => {
            room.players.forEach(player => {
                let socket = this.io.of("/").sockets.get(player.id);
                if (socket) {
                    socket.emit("PlayerDeckUpdated", Array.from(player.deck.values()));
                }
            });
        });

        room.on("RoomBlackCardChanged", (bCard) => {
            roomCh.emit("RoomBlackCardChanged", bCard);
        });

        room.on("RoomStartVoting", (cards) => {
            roomCh.emit("RoomStartVoting", cards);
            room.players.forEach(player => {
                let socket = this.io.of("/").sockets.get(player.id);
                if (socket) {
                    socket.emit("PlayerDeckUpdated", Array.from(player.deck.values()));
                }
            });
        });

        room.on("AnnounceRoomSelectWinner", (player) => {
            roomCh.emit("AnnounceRoomSelectWinner", player);
        });

        room.on("RoomGameFinished", (winner) => {
            roomCh.emit("RoomGameFinished", winner);
        });

        room.on("AnnouncePlayerIsNotReady", player => {
            roomCh.emit("AnnouncePlayerIsNotReady", player.toJSONSimplified());
        });

        room.on("AnnouncePlayerIsReady", player => {
            roomCh.emit("AnnouncePlayerIsReady", player.toJSONSimplified());
            let allReady = true;
            for (let player of room.players.values()) {
                if (!player.ready && (room.czar.id != player.id)) { allReady = false; break; }
            }

            if (allReady) {
                room.startVoting();
            }
        });

        room.on("RoomGoBackToLobby", () => {
            roomCh.emit("RoomGoBackToLobby");
        });

        room.on("RoomStartChoosing", () => {
            roomCh.emit("RoomStartChoosing");
        });

        room.on("RoomCardsDealedPlayer", player => {
                let socket = this.io.of("/").sockets.get(player.id);
                if (socket) socket.emit("PlayerDeckUpdated", Array.from(player.deck.values()));
        });

    }
}