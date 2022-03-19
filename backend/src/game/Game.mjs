import Room from "./Room.mjs";

export default class Game {

    static _instance = null;

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


}