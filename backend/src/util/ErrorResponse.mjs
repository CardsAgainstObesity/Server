/**
 * @typedef {"UknownRoom"} ErrorResponseType
 */


/**
 * Class used to represent error
 * responses.
 */
export default class ErrorResponse {
    /**
     * @param {ErrorResponseType} type 
     */
    constructor(type) {
        this._type = type;
    }

    /**
     * @returns {ErrorResponseType}
     */
    get type() {
        return this._type;
    }

    toJSON() {
        return {
            "type": this.type
        }
    }
}