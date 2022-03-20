import { Server } from 'socket.io';

export default class WSServer {

    /**
     * @type {Server}
     */
    static io;

    /**
     * 
     * @param {*} server HTTP server
     * @param {*} callback Callback function 
     */
    static listen(server, callback) {
        WSServer.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        if (callback && typeof callback == "function") {
            callback(server);
        }
    }

}