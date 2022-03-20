import Player from "../player/Player.mjs";

export default class Room {
    constructor(id) {
        this._id;
        this._players = new Map();
    }

    /**
     * @returns {Map<String,Player>}
     */
    get players() {
        return this._players;
    }

    /**
     * @readonly
     * @returns {Number} Room identifier
     */
    get id() {
        return this._id;
    }

    toJSON() {
        return {
            "id": this.id,
            "players": this.players
        }
    }
}