import Player from "../player/Player.mjs";
import WSServer from "../ws/WSServer.mjs";

/**
 * @typedef {"lobby" | "choose" | "vote"} GameStatus
 */

/**
 * Get player id from index
 * @param {Player[]} arr 
 * @param {String} playerId 
 * @returns 
 */
function getIndexOfPlayer(arr, playerId) {
    for (var i = 0; i < arr.length; i++) {
        let player = arr[i];
        if (player.id == playerId) return i;
    }
    return -1;
}

export default class Room {
    /**
     * 
     * @param {String} id Room identifier 
     * @param {Player} host Room host 
     */
    constructor(id, host, limit, objectiveScore) {
        this._id = id;
        this._players = new Map();
        this._czar = host;
        this._host = host;
        this._status = "lobby";

        this.objectiveScore = objectiveScore || 7;
        this.limit = limit || 10;

        this._deleted = false;
    }

    /**
     * @returns {Map<String,Player>}
     */
    get players() {
        return this._players;
    }

    /**
     * @returns {Player[]}
     */
    get playersArr() {
        return Array.from(this.players.values());
    }

    /**
     * @readonly
     * @returns {Number} Room identifier
     */
    get id() {
        return this._id;
    }

    set czar(value) {
        let currentIndex = this._czar ? getIndexOfPlayer(arr, this._czar.id) : -1;
        if (currentIndex >= 0) { // Previous czar is still in the game ( Check cuz maybe the czar accidentally pressed Ctrl+R, ...)
            this._czar._isCzar = false;
        }
        this._czar = value;
        value._isCzar = true;
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
     * @returns {GameStatus}
     */
    get status() {
        return this._status;
    }

    /**
     * Changes the Czar
     * @param {Player} player 
     */
    setCzar(player) {
        this._czar = player;
    }

    /**
     * @param {GameStatus} status Game status
     */
    setStatus(status) {
        this._status = status;
        WSServer.io.to(this.id).emit("RoomStatusChanged", status);
    }


    /**
     * Adds a player to the room
     * @param {Player} player 
     * @returns True if the player was added, false if the player was already in
     */
    addPlayer(player) {
        if (this._deleted || this.players.has(player.id)) {
            return false;
        } else {
            player.room = this;
            this.players.set(player.id, player);
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
        if (player.id == this.host.id) {
            this.host = this.playersArr[0];
        }
        if (this.isEmpty()) this._deleted = true;
        return this.players.delete(player.id);
    }

    /**
     * Changes the Czar to the next one
     * @returns The new Czar
     */
    nextCzar() {
        let arr = this.playersArr;
        let playerId = this._czar ? this._czar.id : -1;
        if (playerId < 0) {
            this.czar = host;
        } else {
            let currentIndex = getIndexOfPlayer(arr, playerId);
            this.czar = arr[(currentIndex + 1) % arr.length];
            return this.czar;
        }
    }

    toJSON() {
        return {
            "id": this.id,
            "status": this.status,
            "playerCount": this.players.size
        }
    }

}