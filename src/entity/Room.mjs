import EventHandler from "./EventHandler.mjs";
import Lobby from "./Lobby.mjs";
import Player from "./Player.mjs";

const MIN_WHITE_CARDS_AMOUNT = 30;
const MIN_BLACK_CARDS_AMOUNT = 30;
const MIN_PLAYERS_AMOUNT = 2;

/**
 * 
 * @param {Player} player 
 * @param {Player[]} playerList 
 */
function getPlayerIndex(player, playerList) {
    playerList.forEach((p, index) => {
        if (p.id == player.id) return index;
    });
    return -1;
}

/**
 * @typedef {"lobby" | "choosing" | "voting" | "finished"} RoomStatus
 */

/**
 * @typedef {"LobbyRemoveCardpackSuccess" | "LobbyAddCardpackSuccess" | "RoomStart" | "RoomRemoved" | "RoomPlayerConnection" | "RoomPlayerDisconnection" | "RoomStatusChanged" | "RoomCzarChanged"} GameEvent
 */

export default class Room extends EventHandler {
    /**
     * 
     * @param {String} roomId Room identifier 
     * @param {Player} createdBy The player that created the room
     */
    constructor(roomId, createdBy) {
        super();
        this.__roomId = roomId;
        this.__players = new Map();
        this.__status = "lobby";
        this.__czar = createdBy;
        this.__goalObesity = 7;
        this.__createdBy = createdBy;
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
        return this.__czar;
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
        if (this.players.size == this.maxPlayers) throw new Error("RoomCapacityExceed");
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
        this.players.delete(player.id);
        this.emit("RoomPlayerDisconnection", player.toJSON());
    }

    /**
     * Removes the room
     */
    remove() {
        this.setStatus("finished");
        this.emit("RoomRemoved", this.toJSON());
    }

    /**
     * 
     * @returns {Promise<"NotEnoughCards" | "NotEnoughPlayers">} Resolves to false if the room started successfully, else resolves to error message
     */
    start() {
        if (this.status != "lobby") return;
        // Get the final cardpacks
        return new Promise((resolve, reject) => {
            this.lobby
                .joinCardpacks()
                .then(cardpack => {
                    console.log(cardpack)
                    let white_am = cardpack.cards["en"] == undefined ? 0 : cardpack.cards["en"]["white"].length;
                    let black_am = cardpack.cards["en"] == undefined ? 0 : cardpack.cards["en"]["black"].length;
                    if (this.players.size < MIN_PLAYERS_AMOUNT) {
                        resolve("NotEnoughPlayers");
                    }
                    else if (white_am >= MIN_WHITE_CARDS_AMOUNT && black_am >= MIN_BLACK_CARDS_AMOUNT) {
                        this.__cards = cardpack.cards;
                        resolve(false);
                        this.emit("RoomStart", this.toJSON());
                        this.setStatus("choosing");
                    } else {
                        resolve("NotEnoughCards");
                    }
                })
                .catch(console.error)
        });
    }

    /**
     * @param {import("./Cardpack.mjs").DefaultCardpackId} packId
     * @returns {Promise<import("./Cardpack.mjs").PackInfoType>} 
     */
    addCardPack(packId) {
        if (this.status != "lobby") return;
        // Add the cardpack to the lobby
        return new Promise((resolve, reject) => {
            this.lobby
                .addCardPack(packId)
                .then(cardpack => {
                    this.emit("LobbyAddCardpackSuccess", cardpack.pack_info);
                    resolve(cardpack.pack_info);
                })
                .catch(reject);
        });
    }

    /**
     * @param {import("./Cardpack.mjs").DefaultCardpackName} packId 
     * @returns {boolean} True if pack was removed, else false
     */
    removeCardPack(packId) {
        if (this.status != "lobby") return false;
        // Remove the cardpack to the lobby
        if (this.lobby.removeCardPack(packId)) {
            this.emit("LobbyRemoveCardpackSuccess", packId);
            return true;
        } else return false;
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