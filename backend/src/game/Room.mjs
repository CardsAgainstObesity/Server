import Player from "../player/Player.mjs";

export default class Room {
    constructor(id) {
        this._id = id;
        this._players = new Map();
        this._limit;
        this._czar;
        this._host;
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
     * The current Czar
     * @returns {Player} The Czar
     */
    get czar() {
        return this._czar;
    }

    set host(value) {
        this._host = value;
    }

    /**
     * @returns {Player} Room host
     */
    get host() {
        return this._host;
    }


    /**
     * Changes the Czar
     * @param {Player} player 
     */
    setCzar(player) {
        this._czar = player;
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
            player.room = this;
            this.players.set(player.id,player);
            return true;
        }
    }

    /**
     * Check if the room has no players in it
     * @returns {boolean} true if the room is empty, else false
     */
    isEmpty() {
        return this.players.size == 0;
    }

    /**
    * Removes a player from the room
    * @param {Player} player 
    * @returns True if the player was removed, else false
    */
    removePlayer(player) {
        return this.players.delete(player.id);
    }

}