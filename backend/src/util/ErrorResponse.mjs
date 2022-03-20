/**
 * @typedef {"UknownRoom" | "RoomAlreadyExists"} ErrorResponseType
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
            "error": true,
            "type": this.type
        }
    }
}