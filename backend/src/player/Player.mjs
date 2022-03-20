import Card from "../card/Card.mjs";

export default class Player {
    constructor() {
        this._id;
        this._obesity;
        this._cards;
        this._socket;
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
     * @readonly
     * @returns {Card[]} Returns player's deck
     */
    get cards() {
        return
    }
}