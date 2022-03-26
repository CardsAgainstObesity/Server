import EventHandler from "./EventHandler.mjs";
import Player from "./Player.mjs";

/**
 * @typedef {"lobby" | "choosing" | "voting" | "finished"} RoomStatus
 */

/**
 * @typedef {"RoomRemoved" | "RoomPlayerConnection" | "RoomPlayerDisconnection" | "RoomStatusChanged" | "RoomCzarChanged"} GameEvent
 */

export default class Room extends EventHandler {
    /**
     * 
     * @param {String} roomId Room identifier 
     */
    constructor(roomId, host) {
        super();
        this.__roomId = roomId;
        this.__players = new Map();
        this.__status = "lobby";
        this.__czar = host;//undefined;
        this.__goalObesity = 7;
        this.__host = host;
        this.__maxPlayers = 8;
    }

    /**
     * @returns {String} Room identifier
     */
    get roomId() {
        return this.__roomId;
    }

    /**
     * @returns {Map<String,Player} Room's players mapped by their id
     */
    get players() {
        return this.__players;
    }

    /**
     * @returns {RoomStatus} Room status
     */
    get status() {
        return this.__status;
    }

    /**
     * @returns {Player} Room's czar
     */
    get czar() {
        return this.__czar;
    }

    get host() {
        return this.__host;
    }

    /**
     * @returns {Number} Room's goal obesity to win
     */
    get goalObesity() {
        return this.__goalObesity;
    }

    /**
     * @returns {Number} Room's max players
     */
    get maxPlayers() {
        return this.__maxPlayers;
    }

    /**
     * Changes the game czar
     * @param {Player} player New czar 
     */
    setCzar(player) {
        this.__czar = player;
        this.emit("RoomCzarChanged", player.toJSON());
    }

    /**
     * Changes the game status
     * @param {RoomStatus} status New game status
     */
    setStatus(status) {
        this.__status = status;
        this.emit("RoomStatusChanged", status);
    }

    /**
     * Adds a listener for given event
     * @param {GameEvent} event 
     * @param {function} callback - Function to run when event emits
     * @override
     */
    on(event, callback) {
        super.on(event, callback);
    }

    /**
     * Add player to the room
     * @param {Player} player 
     */
    addPlayer(player) {
        if(this.players.size == this.maxPlayers) throw new Error("RoomCapacityExceed");
        else {
            player.room = this;
            this.players.set(player.id, player);
            this.emit("RoomPlayerConnection", player.toJSON());
        }
    }

    /**
     * Remove player from the room
     * @param {Player} player 
     */
    removePlayer(player) {
        this.emit("RoomPlayerDisconnection", player.toJSON());
        this.players.delete(player.id);
    }

    /**
     * Removes the room
     */
    remove() {
        this.emit("RoomRemoved", this.toJSON());
    }

    /**
     * Returns the Room
     * instance in a JSON
     * friendly form.
     */
    toJSON() {
        return {
            "roomId": this.roomId,
            "players": Array.from(this.players.values()).map(player => player.toJSON()),
            "czar": this.czar.toJSON(),
            "goalObesity": this.goalObesity,
            "status": this.status
        }
    }

}