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
        WSConnection._socket = io("192.168.0.31:8683");
        WSConnection.socket.on("connect", () => {
            console.log("[WS] Connected to the server");
        });

        WSConnection.socket.on("error", console.error);

    }
}