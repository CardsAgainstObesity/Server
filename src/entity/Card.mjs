export default class Card {

    /**
     * @param {import("./Cardpack.mjs").CardTextType} text 
     */
    constructor(id,text) {
        this.__id = id;
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