import Player from "../player/Player.mjs";

export default class Room {
    constructor(id) {
        this._id;
        this._players = new Map();
        this._limit;
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

    /**
     * Adds a player to the room
     * @param {Player} player 
     * @returns True if the player was added, false if the player was already in
     */
    addPlayer(player) {
        if(this.players.has(player.id)) {
            return false;
        }
        else {
            this.players.set(player.id,player);
            return true;
        }
    }

    /**
    * Removes a player from the room
    * @param {Player} player 
    * @returns True if the player was removed, else false
    */
    removePlayer(player) {
        return this.players.delete(player.id);
    }

    toJSON() {
        return {
            "id": this.id,
            "players": this.players
        }
    }
}