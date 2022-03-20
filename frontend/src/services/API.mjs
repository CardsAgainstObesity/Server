export default class API {
    static endpoint = window.location + "api";

    static getRoomPlayers(roomId) {
        return new Promise((resolve,reject) => {
            fetch(this.endpoint + "/room/players/" + roomId)
            .then(res => res.json())
            .then(resolve)
            .catch(reject);
        })  
    }
}