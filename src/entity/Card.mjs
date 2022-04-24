export default class Card {

    static lastId = 0;

    /**
     * @param {import("./Cardpack.mjs").CardTextType} text 
     */
    constructor(text) {
        this.__id = ++Card.lastId;
        this.__text = text;
    }

    /**
     * @returns {import("./Cardpack.mjs").CardTextType} Card's text in different languages
     */
    get text() {
        return this.__text;
    }

    get id() {
        return this.__id;
    }

    toJSON() {
        return {
            "id": this.id,
            "text": this.text
        }
    }
}