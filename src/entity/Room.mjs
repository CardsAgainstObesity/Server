import BlackCard from "./BlackCard.mjs";
import Card from "./Card.mjs";
import EventHandler from "./EventHandler.mjs";
import Lobby from "./Lobby.mjs";
import Player from "./Player.mjs";
import ReplayBuilder from "../util/ReplayBuilder.mjs";

const MIN_WHITE_CARDS_AMOUNT = 30;
const MIN_BLACK_CARDS_AMOUNT = 30;
const MIN_PLAYERS_AMOUNT = 2;

// DEBUG
const DEBUG_BLACK_CARD = {
    slots: 2,
    text: {
        en: "Text 1: \"___\". Text 2: \"___\".",
        es: "Text 1: \"___\". Text 2: \"___\".",
    }
}


/**
 * 
 * @param {Player} player 
 * @param {Player[]} playerList 
 */
function getPlayerIndex(player, playerList) {
    let returnValue = -1;
    let found = false;
    for (let index = 0, len = playerList.length; index < len && !found; index++) {
        let p = playerList[index];
        if (p.id == player.id) {
            returnValue = index;
            found = true;
        }
    }
    return returnValue;
}

/**
 * @typedef {"lobby" | "choosing" | "voting" | "finished"} RoomStatus
 */

/**
 * @typedef {"RoomStartChoosing" | "RoomGoBackToLobby" | "AnnouncePlayerIsReady" | "AnnouncePlayerIsNotReady" | "RoomGameFinished" | "AnnounceRoomSelectWinner" | "RoomBlackCardChanged" | "RoomCardsDealed" | "RoomCardsDealedPlayer" | "LobbyRemoveCardpackSuccess" | "LobbyAddCardpackSuccess" | "RoomStart" | "RoomRemoved" | "RoomPlayerConnection" | "RoomPlayerDisconnection" | "RoomStatusChanged" | "RoomCzarChanged" | "PlayerKicked"} GameEvent
 */

export default class Room extends EventHandler {
    /**
     * 
     * @param {String} roomId Room identifier 
     * @param {Player} createdBy The player that created the room
     */
    constructor(roomId, createdBy, privateRoom = false, password = "") {
        super();
        this.__roomId = roomId;
        this.__players = new Map();
        this.__status = "lobby";
        this.__czar = createdBy;
        this.__goalObesity = 7;
        this.__createdBy = createdBy;
        this.__maxPlayers = 8;
        this.__minPlayers = MIN_PLAYERS_AMOUNT;
        this._firstHost = createdBy;

        this.__privateRoom = (privateRoom == "true" || privateRoom == true) ? true : false;
        this.__password = password;

        this.__lobby = new Lobby();
        this.__blackCard = undefined;
        this.__cards = undefined;

        this.__replay = new ReplayBuilder(this);

        this.__lastWinner = undefined;

        this.prepareSnapshot();

    }

    /**
     * @returns {import("./Cardpack.mjs").CardDeck}
     */
    get cards() {
        return this.__cards;
    }


    /**
     * @returns {BlackCard}
     */
    get blackCard() {
        return this.__blackCard;
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
     * @returns {boolean} Room privacy
     */
    get privateRoom() {
        return this.__privateRoom;
    }

    /**
     * @returns {string} Room's password, if the room is private
     */
    get password() {
        return this.__password;
    }

    /**
     * @returns {Player} Room's czar
     */
    get czar() {
        return this.__czar;
    }

    get replay() {
        return this.__replay.replay;
    }

    /**
     * @returns {Player}
     */
    get host() {
        return this._firstHost ? this._firstHost : this.__czar;
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
    * @returns {Number} Room's min players
    */
    get minPlayers() {
        return this.__minPlayers;
    }

    /**
     * Changes the game czar
     * @param {Player} player New czar 
     */
    setCzar(player) {
        this.__czar = player;
        this.emit("RoomCzarChanged", player.toJSONSimplified());
    }

    /**
     * Sets the next czar
     */
    rotateCzar() {
        const playerList = Array.from(this.players.values());
        const index = getPlayerIndex(this.czar, playerList);
        const nextCzar = playerList[(index + 1) % playerList.length];
        this.setCzar(nextCzar);
    }

    setBlackCard(bCard) {
        this.__blackCard = bCard;
        this.emit("RoomBlackCardChanged", bCard);
    }

    /**
     * Sets the next black card
     */
    nextBlackCard() {
        let bCard = this.cards.black.pop();
        if (bCard != undefined) {
            this.setBlackCard(bCard);
        }
    }

    /**
     * Changes the game status
     * @param {RoomStatus} status New game status
     */
    setStatus(status) {
        this.__status = status;
        this.__replay.prepareSnapshot();
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
            this.emit("RoomPlayerConnection", player.toJSONSimplified());
        }
    }

    /**
     * Remove player from the room
     * @param {Player} player 
     */
    removePlayer(player) {
        if (this._firstHost && player.id == this._firstHost.id) this._firstHost = undefined;
        this.players.delete(player.id);
        player.leaveRoom();
        this.emit("RoomPlayerDisconnection", player.toJSONSimplified());
    }

    /**
     * Removes the room
     */
    remove() {
        this.setStatus("finished");
        for(const player of this.players) {
            this.kickPlayer(player);
        }
        this.emit("RoomRemoved", this.toJSON());

        // TODO: How to dist the replay
        this.__replay.saveReplay();
    }

    /**
     * 
     * @returns {Promise<"NotEnoughCards" | "NotEnoughPlayers">} Resolves to false if the room started successfully, else resolves to error message
     */
    start() {
        this.createSnapshot(true);
        this.prepareSnapshot();
        // Get the final cardpacks
        return new Promise((resolve, reject) => {
            if (this.status != "lobby") resolve("RoomAlreadyStarted");
            else {
                this.lobby
                    .joinCardpacks()
                    .then(cardpack => {
                        let white_am = cardpack.cards.white.length;
                        let black_am = cardpack.cards.black.length;
                        if (this.players.size < this.minPlayers) {
                            resolve("NotEnoughPlayers");
                        }
                        else if (white_am >= MIN_WHITE_CARDS_AMOUNT && black_am >= MIN_BLACK_CARDS_AMOUNT) {
                            this.__cards = cardpack.cards;
                            resolve(false);

                            this.resetPlayers();
                            this.setStatus("choosing");
                            this.dealCards(10, true);
                            this.setBlackCard(this.cards.black[0]);

                            this.emit("RoomStart", this.toJSON());
                            // this.setBlackCard(DEBUG_BLACK_CARD);
                        } else {
                            resolve("NotEnoughCards");
                        }
                    });
            }
        });
    }

    /**
     * Sets a player as ready.
     * @param {Player} player 
     */
    playerReady(player) {
        if (this.status != "choosing") {
            return;
        }
        player.ready = true;
        this.emit("AnnouncePlayerIsReady", player);
    }

    playerNotReady(player) {
        if (this.status != "choosing") {
            return;
        }
        player.ready = false;
        player.selectedCards.length = 0;
        this.emit("AnnouncePlayerIsNotReady", player);
    }

    kickPlayer(player) {
        this.emit("PlayerKicked",player);
        this.removePlayer(player);
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
     * @param {import("./Cardpack.mjs").DefaultCardpackId} packId 
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
     * 
     * @param {number} amount Amount of cards to give to each player 
     * @param {boolean} force Ignore give cards to everyone including the czar
     */
    dealCards(amount, force) {
        if (this.status == "lobby" || this.cards.white.length == 0) return;

        this.players.forEach(player => {
            if (player.id != this.czar.id || force) {
                let card = this.cards.white.pop();
                for (let i = 0; i < amount && card != undefined; i++) {
                    card = this.cards.white.pop();
                    player.deck.set(card.id, card);
                }
            }
        });
        this.emit("RoomCardsDealed");
    }

    /**
    * @param {Player} player The player top whom the cards will be given
    * @param {number} amount Amount of cards to give to each player 
    * @param {boolean} force Ignore give cards to everyone including the czar
    */
    dealCardsPlayer(player, amount, force) {
        if (!player || this.status == "lobby" || this.cards.white.length == 0) return;

        if (player.id != this.czar.id || force) {
            let card = this.cards.white.pop();
            for (let i = 0; i < amount && card != undefined; i++) {
                card = this.cards.white.pop();
                player.deck.set(card.id, card);
            }
        }

        this.emit("RoomCardsDealedPlayer", player);
    }

    /**
     * Resets every player's score and deck
     */
    resetPlayers() {
        this.players.forEach(player => {
            player.clearCards();
            player.resetScore();
        });
    }

    /**
     * Changes the game status to voting
     * and prepares everything for voting
     */
    startVoting() {
        
        let cards = [];
        let err = false;
        
        if (this.status != "choosing") {
            return;
        }

        this.createSnapshot(true);
        this.prepareSnapshot();

        let playersArr = Array.from(this.players.values());
        for (let i = 0, len = playersArr.length; i < len && !err; i++) {
            let player = playersArr[i];
            if (this.czar.id == player.id) {
                //  Czar can't select any card, simply ignore the czar
            }
            else {
                let ready = player.ready;
                if (!ready) err = true;
                else {
                    let selectedCards = {
                        "player_id": player.id,
                        "cards": [],
                        "flipped": false
                    };
                    while (player.selectedCards.length > 0) {
                        let card = player.selectedCards.pop();
                        selectedCards.cards.push(card);
                        player.deck.delete(card.id);
                    }
                    cards.push(selectedCards);
                }
            }

        }

        if (!err) {
            this.emit("RoomStartVoting", cards);
            this.setStatus("voting");
        }
    }

    selectWinner(player_id) {
        if (this.status != "voting") {
            return;
        }

        let pWinner = this.players.get(player_id);
        if (pWinner && this.status == "voting") {
            pWinner.obesity++;
            this.__lastWinner = pWinner;

            this.emit("AnnounceRoomSelectWinner", pWinner.toJSON());

            if (pWinner.obesity >= this.goalObesity) {
                this.setStatus("finished");

                this.createSnapshot(true);
                this.prepareSnapshot();

                this.emit("RoomGameFinished", pWinner.toJSON());
            }
        }
    }

    backToLobby() {
        if (this.status == "finished") {

            this.createSnapshot(true);
            // this.prepareSnapshot();

            // Prepare new lobby
            this.__lobby = new Lobby();
            this.__blackCard = undefined;
            this.__cards = undefined;
            
            this.__replay.clearReplay();

            this.setStatus("lobby");
            this.emit("RoomGoBackToLobby");

        }
    }

    backToChoosing() {
        if (this.status == "voting") {

            this.createSnapshot(true);
            this.prepareSnapshot();

            // Deal the same amount of cards used for the previous black card
            let currentSlots = this.blackCard.slots;
            this.dealCards(currentSlots);

            // Rotate the czar
            this.rotateCzar();

            // Set the next black card
            this.nextBlackCard();
            // this.setBlackCard(DEBUG_BLACK_CARD);

            // Empty selected cards
            this.players.forEach(player => {
                player.selectedCards.length = 0;
            });

            this.setStatus("choosing");
            this.emit("RoomStartChoosing");
        }
    }

    prepareSnapshot() {
        this.__replay.prepareSnapshot();
    }

    createSnapshot(fillPrepared) {
        this.__replay.createSnapshot(fillPrepared);
    }

    /**
     * Returns the Room
     * instance in a JSON
     * friendly form.
     */
    toJSON() {
        return {
            "roomId": this.roomId,
            "players": Array.from(this.players.values()).map(player => player.toJSONSimplified()),
            "czar": this.czar.toJSONSimplified(),
            "goalObesity": this.goalObesity,
            "status": this.status,
            "private" : this.__privateRoom
        }
    }

    toJSONSimplified() {
        return {
            "roomId": this.roomId,
            "players": Array.from(this.players.values()).map(player => player.name),
            "maxPlayers": this.maxPlayers, 
            "host": this.host.name,
            "goalObesity": this.goalObesity,
            "status": this.status,
            "private" : this.__privateRoom
        }
    }

}