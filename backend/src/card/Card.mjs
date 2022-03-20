export default class Card {

    constructor(isDark) {
        this._isDark = isDark;
    }

    /**
     * @readonly
     * @returns {boolean} true if the card is black, false if the card is white
     */
    get isDark() {
        return this._isDark;
    }
}