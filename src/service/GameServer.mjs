import http from 'http';
import { createRequire } from "module";
import { Server } from "socket.io";
import Player from "../entity/Player.mjs";
import Room from "../entity/Room.mjs";
import LoggingSystem from "../util/LoggingSystem.mjs";

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
                let roomId = id ? id.replace(" ", "").slice(0, 10) : Date.now().toString(36).substr(2);
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

                if (!name || name == "") {
                    // Get random name
                    newName = random_name[Math.floor(Math.random() * random_name.length)];
                } else {
                    newName = name.slice(0, 25);
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
            });
            // ----
            // Remove cardpack 
            // ----
            socket.on("LobbyRemoveCardpackRequest", (args) => {
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
            });
            // ----
            // Start the game
            // ----
            socket.on("RoomStartRequest", (room_id) => {
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

            });

            // ----
            // Player is ready ( prepare selected cards )
            // ----
            socket.on("PlayerIsReady", (card_ids) => {
                if (!player.ready) {
                    let err = false;
                    let room = player.room;
                    if (room && room.blackCard) {

                        let bCard = room.blackCard;
                        if (card_ids.length == bCard.slots) {
                            for (let i = 0, len = card_ids.length; i < len && !err; i++) {
                                let id = card_ids[i];
                                if (!player.deck.has(id)) {
                                    socket.emit("error", "PlayerDoesntOwnThatCard");
                                    err = true;
                                }
                                else {
                                    player.selectedCards.push(player.deck.get(id));
                                }
                            }

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
            });

            // ----
            // Player is not ready
            // ----
            socket.on("PlayerIsNotReady", () => {
                let room = player.room;
                if (room && room.blackCard) {
                    room.playerNotReady(player);
                    // socket.to(room.roomId).emit("AnnouncePlayerIsNotReady", player.toJSON())
                }
            });

            // ----
            // Czar wants to start voting ( all players must be ready ) 
            // ----
            socket.on("RoomStartVotingRequest", (room_id) => {
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
                                if (!player.ready) { allReady = false; break; }
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
            });

            // ----
            // Czar selected winner 
            // ----
            socket.on("RoomSelectWinnerRequest", (player_id) => {
                var id = parseInt(player_id);
                if (isNaN(id)) {
                    socket.emit("error", "InvalidEventArgs");
                } else {
                    let room = player.room;
                    if (!room) {
                        socket.emit("error", "PlayerNotInARoom");
                    } else if (player.id != room.czar.id) {
                        socket.emit("error", "NoPermissions");
                    } else {
                        let pWinner = room.players.get(player_id);
                        if (!pWinner) {
                            socket.emit("error", "InvalidEventArgs");
                        } else {
                            room.selectWinner(player_id);
                        }
                    }
                }
            });

            // ----
            // After the game ended, the last Czar can send players to lobby
            // ----
            socket.on("RoomGoBackToLobbyRequest", () => {
                let room = player.room;
                if (!room) {
                    socket.emit("error", "PlayerNotInARoom");
                } else if (player.id != room.czar.id) {
                    socket.emit("error", "NoPermissions");
                } else {
                    room.backToLobby();
                }
            });

            // ----
            // Czar fliped a card
            // ----
            socket.on("RoomFlipCardRequest", (card_id) => {
                if(player.room && player.room.status == "voting") {
                    if(player.id == player.room.czar.id) {
                        socket.to(player.room.roomId).emit("RoomFlipCard", card_id);
                    } else {
                        socket.emit("error","NoPermissions");
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

        /*
        room.on("RoomStatusChanged", (status) => {
            roomCh.emit("RoomStatusChanged", status);
        });
        */

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
            roomCh.emit("AnnouncePlayerIsNotReady", player.toJSON());
        });

        room.on("AnnouncePlayerIsReady", player => {
            roomCh.emit("AnnouncePlayerIsReady", player.toJSON());
            let allReady = true;
            for (let player of room.players.values()) {
                if (!player.ready) { allReady = false; break; }
            }

            if(allReady) {
                room.startVoting();
            }
        })

    }
}