import { Server } from 'socket.io';

export default class WSServer {

    static io;

    static listen(port, callback) {
        WSServer.io = new Server(port);
        if (callback && typeof callback == "function") {
            callback(port);
        }
    }

    static on(event, callback) {
        WSServer.on(event, callback);
    }

}