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
        // TODO : Cambiar para producción
        WSConnection._socket = io("localhost:8683");

        WSConnection.socket.on("connect", () => {
            console.log("[WS] Connected to the server");
        });

        WSConnection.socket.on("error", console.error);
        WSConnection.socket.on("RoomConnectionSuccess", (room) => {
            console.log("[WS] Connected to room: ", room);
            Room.roomId = room.id;
        });
        WSConnection.socket.on("PlayerConnected", (player) => {
            console.log(player);
            Room.addPlayer(player);
        });

        WSConnection.socket.on("PlayerDisconnected", (player) => {
            console.log(player);
            Room.removePlayer(player);
        });

        WSConnection.socket.on("RoomStatusChanged");

    }

    static joinRoom(roomId) {
        WSConnection.socket.emit("roomJoinRequest", roomId);
    }

    static changeName(newName) {
        WSConnection.socket.emit("RequestPlayerChangeName", newName);
    }
}