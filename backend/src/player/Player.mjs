import { Socket } from "socket.io";
import Card from "../card/Card.mjs";
import Room from "../game/Room.mjs";

export default class Player {
    /**
     * 
     * @param {Socket} socket Player assigned socket 
     */
    constructor(socket) {
        this._id = socket.id;
        this._name;
        this._obesity;
        this._cards;
        this._socket;
        this._room;
    }

    /**
     * @readonly
     * @returns {Number} Player identifier
     */
    get id() {
        return this._id;
    }

    /**
     * @readonly
     * @returns {Number} Obesity of the player
     */
    get obesity() {
        return this._obesity;
    }

    /**
     * @returns {String} Player name
     */
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    /**
     * @returns {Room} The room the player is in
     */
    get room() {
        return this._room;
    }

    /**
     * @readonly
     * @returns {Card[]} Returns player's deck
     */
    get cards() {
        return
    }
}