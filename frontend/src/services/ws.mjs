import { io, Socket } from 'socket.io-client';
import Room from './Room.mjs';

export default class WSConnection {

    /**
     * @type {Socket}
     */
    static _socket = null;

    static get socket() {
        if (this._socket == null) throw new Error("Client is not connected to the WS server!");
        return this._socket;
    }

    static connect() {
        // Create a connection to the WS server
        WSConnection._socket = io(window.location.hostname + ":" + window.location.port); // TODO: Cambiar para producción

        WSConnection.socket.on("connect", () => {
            console.log("[WS] Connected to the server");
        });

        WSConnection.socket.on("error", (err) => {
            console.error("ERROR:",err);
        });

        WSConnection.socket.on("RoomConnectionSuccess", (room) => {
            console.log("[WS] Connected to room: ", room);
            Room.setCzar(room.czar);
            Room.roomId = room.id;
            room.players.forEach(ply =>{
                Room.addPlayer(ply);
            });
        });

        WSConnection.socket.on("RoomCreationSuccess", (room) => {
            console.log("[WS] Created room: ", room);
            Room.setCzar(room.czar);
            Room.roomId = room.id;
            room.players.forEach(ply =>{
                Room.addPlayer(ply);
            });
        });

        WSConnection.socket.on("RoomPlayerConnection", (player) => {
            console.log("[WS] Player connected: ",player);
            Room.addPlayer(player);
        });

        WSConnection.socket.on("RoomPlayerDisconnection", (player) => {
            console.log("[WS] Player disconnected: ",player);
            Room.removePlayer(player);
        });

        WSConnection.socket.on("RoomStatusChanged", (status) => {
            console.log("[WS] Room status changed: ",status);
            Room.status = status;
        });

        WSConnection.socket.on("RoomCzarChanged", (newCzar) => {
            console.log("[WS] Room Czar changed: ", newCzar);
            Room.setCzar(newCzar);
        });

        WSConnection.socket.on("RoomStart", () => {
            console.log("[WS] Room started!");
            Room.start();
        })

    }

    static createRoom(roomId) {
        WSConnection.socket.emit("RoomCreationRequest",roomId);
    }

    static joinRoom(roomId) {
        WSConnection.socket.emit("RoomConnectionRequest", roomId);
    }

    static changeName(newName) {
        WSConnection.socket.emit("RequestPlayerChangeName", newName);
    }
}