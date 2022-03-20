import { io, Socket } from 'socket.io-client';

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
        WSConnection._socket = io();
        WSConnection.socket.on("connect", () => {
            console.log("[WS] Connected to the server");
        });

        WSConnection.socket.on("error", console.error);
        WSConnection.socket.on("roomConnectionSuccess", (roomId) => {
            console.log("[WS] Connected to room: " , roomId);
        });
    }

    static joinRoom(roomId) {
        WSConnection.socket.emit("roomJoinRequest",roomId);
        // Temporal
        WSConnection.socket.emit("changeName","Sandvich-" + Math.floor(Math.random() * Date.now()));
    }
}