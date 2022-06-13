import Card from "./Card.mjs";
import Room from "./Room.mjs";

export default class Player {
    constructor(id) {
        this.__id = id;
        this.__obesity = 0;
        this.__room;
        this.__name;
        this.__deck = new Map();
        this.__selectedCards = [];
        this.__ready = false;
    }   

    /**
     * @returns {String} Player identifier
     */
    get id() {
        return this.__id;
    }

    /**
     * @returns {Number} Player's obesity number
     */
    get obesity() {
        return this.__obesity;
    }

    set obesity(value) {
        this.__obesity = value;
    }

    /**
     * @returns {Room} The room the player is in
     */
    get room() {
        return this.__room;
    }

    set room(value) {
        this.__room = value;
    }

    set name(value) {
        this.__name = value;
    }

    /**
     * @returns {String}
     */
    get name() {
        return this.__name;
    }

    /**
     * @returns {Map<String,Card>}
     */
    get deck() {
        return this.__deck;
    }

    /**
     * @returns {boolean}
     */
    get ready() {
        return this.__ready;
    }

    set ready(value) {
        this.__ready = value;
    }

    /**
     * @returns {Card[]}
     */
    get selectedCards() {
        return this.__selectedCards;
    }

    /**
     * Clears a player's deck
     */
    clearCards() {
        this.__deck.clear();
        this.__selectedCards.length = 0;
        this.__ready = false;
    }

    /**
     * Sets score to 0
     */
    resetScore() {
        this.__obesity = 0;
    }

    /**
     * If the player is in a room, leaves it
     */
    leaveRoom() {
        if(this.room) {
            this.room.removePlayer(this);
            this.__room = undefined;
            this.__deck = new Map();
            this.__ready = false;
            this.__selectedCards = [];
        }
    }

    /**
     * Returns the Player
     * instance in a JSON
     * friendly form.
     */
    toJSON(){
        return {
            "id": this.id,
            "obesity" : this.obesity,
            "name": this.name,
            "ready": this.ready,
            "deck": Array.from(this.deck.values()).map(card => card.toJSON()),
            "selectedCards" : this.selectedCards.map(card => card.toJSON())
        }
    }

    toJSONSimplified() {
        return {
            "id": this.id,
            "obesity" : this.obesity,
            "name": this.name,
            "ready": this.ready
        }
    }
}