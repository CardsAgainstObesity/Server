import Room from "./Room.mjs";

export default class Player {
    constructor(id) {
        this.__id = id;
        this.__obesity = 0;
        this.__room;
        this.__name;
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
     * If the player is in a room, leaves it
     */
    leaveRoom() {
        if(this.room) {
            this.room.removePlayer(this);
            this.__room = undefined;
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
            "name": this.name
        }
    }
}