import express from 'express';
import { createRequire } from "module";
import http from 'http';
import LoggingSystem from './src/util/LoggingSystem.mjs';
import GameServer from './src/service/GameServer.mjs';
import CardPackParser from './src/util/CardPackParser.mjs';
import fs from 'fs';

const require = createRequire(import.meta.url);
const config = require("./config.json");

const app = express();
//app.use(express.static(path.resolve('../frontend/dist')));

// HTTP Server instance
const server = http.createServer(app);

// Start listening for requests on configured port
server.listen(config.port, () => {
    let host = server.address().address + ":" + server.address().port;
    LoggingSystem.singleton.log("[WEB]", "Listening to " + host);
});

// Link GameServer to HTTP server
GameServer.singleton.listen(server);

// Test
var white_data = fs.readFileSync("./resources/cardpacks/base_game/white_cards.csv");
var black_data = fs.readFileSync("./resources/cardpacks/base_game/black_cards.csv");
var pack_data = require("./resources/cardpacks/base_game/pack.json");
const base = new CardPackParser(pack_data,white_data.toString(),black_data.toString());
base.parse()
.then();