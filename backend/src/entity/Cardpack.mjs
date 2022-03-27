import { readPasteBin } from "../util/Pastebin.mjs";

const default_cardpacks = {
    "base" : "../../resources/cardpacks/base_game/pack.json"
}

export default class Cardpack {
    constructor() {}
    
    /**
     * @param {String} source Pastebin URL or default pack name
     */
    static from(source) {
        return new Promise((resolve, reject) => {
            let urlCheck = /https:\/\/pastebin\.com\/.*/;
            if (urlCheck.test(source)) {
                // Source is pastebin url
                let pasteKey = source.slice(source.lastIndexOf("/"));
                readPasteBin(pasteKey)
                    .then((content) => {
                        try {
                            resolve(JSON.parse(content));
                        } catch {
                            reject("Invalid JSON");
                        }
                    });
            } else {
                // Check if its a default cardpack
                let cardpack = default_cardpacks[source];
                if(cardpack) {
                    fetch(cardpack)
                    .then(res => res.json())
                    .then(resolve)
                    .catch(reject);
                } else {
                    reject("Invalid cardpack");
                }
            }
        });
    }
}