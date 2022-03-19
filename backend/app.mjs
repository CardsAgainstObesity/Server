import express from 'express';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import { createRequire } from "module";
import WSServer from './src/ws/WSServer.mjs';

const require = createRequire(
    import.meta.url);

const app = express();
const config = require("./config.json");



/*       API       */
app.get("/join/:room", (req, res) => {
    let roomId = req.params.room;
});

/*      SERVER     */

app.listen(config.server.webPort, () => {

    LoggingSystem.singleton.log("[API] Listening to " + config.server.webPort);

    WSServer.listen(config.server.wsPort, (port) => {
        LoggingSystem.singleton.log("[WSServer] Listening to " + port);
    });

    WSServer.on("connection", () => {

    });


});