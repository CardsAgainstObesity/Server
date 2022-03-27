import EventHandler from "./EventHandler.mjs";
import Lobby from "./Lobby.mjs";
import Player from "./Player.mjs";

/**
 * 
 * @param {Player} player 
 * @param {Player[]} playerList 
 */
function getPlayerIndex(player, playerList) {
    playerList.forEach((p,index) => {
        if(p.id == player.id) return index;
    });
    return -1;
}

/**
 * @typedef {"lobby" | "choosing" | "voting" | "finished"} RoomStatus
 */

/**
 * @typedef {"RoomStart" | "RoomRemoved" | "RoomPlayerConnection" | "RoomPlayerDisconnection" | "RoomStatusChanged" | "RoomCzarChanged"} GameEvent
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
        this.__czar = host;
        this.__goalObesity = 7;
        this.__host = host;
        this.__maxPlayers = 8;

        this.__lobby = new Lobby();
        this.__cards;
    }

    /**
     * @returns {Lobby}
     */
    get lobby() {
        return this.__lobby;
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

    /**
     * @returns {Player}
     */
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

    rotateCzar() {
        let playerList = Array.from(this.players.values());
        let index = getPlayerIndex(this.czar, playerList);
        let nextCzar = playerList[(index + 1) % playerList.length];
        this.setCzar(nextCzar);
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
        this.setStatus("finished");
        this.emit("RoomRemoved", this.toJSON());
    }

    start() {

        // Get the final cardpacks
        this.lobby
        .joinCardpacks()
        .then(cards => {
            this.__cards = cards;
            this.emit("RoomStart");
            this.setStatus("choosing");
        })

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