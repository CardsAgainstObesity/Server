import fs from 'fs';
import path from 'path';
const default_cardpacks = {
    "base": "./resources/cardpacks/base_game/pack.json"
}

/**
 * @typedef {"base"} DefaultCardpackId
 */

/**
 * @typedef PackInfoType   
 * @property {String} id
 * @property {String} author
 * @property {Object} name 
 * @property {String} name.es
 * @property {String} name.en
 */

/**
 * @typedef CardpackType
 * @property {PackInfoType} pack_info
 * @property {Object} cards
 * @property {Object} cards.en
 * @property {String[]} cards.en.white
 * @property {String[]} cards.en.black 
 * @property {Object} cards.es
 * @property {String[]} cards.es.white
 * @property {String[]} cards.es.black 
 */

export class Cardpack {
    constructor() { }

    /**
     * @param {DefaultCardpackId} name Default pack name
     * @returns {Promise<CardpackType>}
     */
    static from(name) {
        return new Promise((resolve, reject) => {
            // Check if its a default cardpack
            let cardpack = default_cardpacks[name];
            if (cardpack) {
                fs.promises.readFile(path.resolve(cardpack), {
                    encoding: "utf8"
                })
                    .then(buffer => {
                        try {
                            var json = JSON.parse(buffer.toString());
                            resolve(json);
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .catch(console.error);


            } else {
                reject("Invalid cardpack");
            }
        });
    }
}