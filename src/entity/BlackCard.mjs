import Card from "./Card.mjs";

export default class BlackCard extends Card {
    /**
     * 
     * @param {import("./Cardpack.mjs").CardTextType} text 
     * @param {number} slots Number of white cards slots 
     */
    constructor(text,slots) {
        super(text);
        this.__slots = slots;
    }

    /**
     * @returns {number} Number of white cards slots
     */
    get slots() {
        return this.__slots;
    }

    toJSON() {
        return {
            "id": this.id,
            "text": this.text,
            "slots": this.slots
        }
    }
}