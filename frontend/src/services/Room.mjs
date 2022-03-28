export default class Room {

    static _roomId = "";
    static _players = new Map();
    static _status = "lobby";
    static _czar = null;
    

    static get players() {
        return Room._players;
    }

    static get playersArr() {
        return Array.from(Room._players.values());
    }

    static get roomId() {
        return Room._roomId;
    }
    static set roomId(value) {
        Room._roomId = value;
    }

    static addPlayer(player) {
        Room._players.set(player.id, player);
    }

    static removePlayer(player) {
        Room._players.delete(player.id);
    }
    
    static setCzar(player) {
        Room._czar = player;
    }

    static getCzar() {
        return Room._czar;
    }

    static start() {
        // TODO
    }
}