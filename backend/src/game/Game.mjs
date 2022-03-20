import ErrorResponse from "../util/ErrorResponse.mjs";
import LoggingSystem from "../util/LoggingSystem.mjs";
import Room from "./Room.mjs";

export default class Game {

    static _instance = null;

    /**
     * @returns {Game} Game instance
     */
    static get singleton() {
        if (Game._instance == null)
            Game._instance = new Game();
        return Game._instance;
    }

    constructor() {
        this._rooms = new Map();
    }

    /**
     * @returns {Map<String,Room>} Game rooms, mapped by their id
     */
    get rooms() {
        return this._rooms;
    }

    /**
     * Creates a room with given name
     * @param {String} roomId 
     * @returns { Room | ErrorResponse } Returns the room created or error if room couldn't be created
     */
    createRoom(roomId) {
        if(this.rooms.has(roomId)) {
            return new ErrorResponse("RoomAlreadyExists");
        } else {
            let room = new Room(roomId);
            this.rooms.set(roomId,room);
            LoggingSystem.singleton.log("[Game] Created a new room : " + roomId);
        }
    }

}