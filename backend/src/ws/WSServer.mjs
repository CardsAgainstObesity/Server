import { Server } from 'socket.io';

export default class WSServer {

    /**
     * @type {Server}
     */
    static io;

    static listen(port, callback) {
        WSServer.io = new Server(port, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        if (callback && typeof callback == "function") {
            callback(port);
        }
    }

}