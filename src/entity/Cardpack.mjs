import fs from 'fs';
import path, { resolve } from 'path';
import BlackCard from './BlackCard.mjs';
import Card from './Card.mjs';
const default_cardpacks = {
    "base": "./resources/cardpacks/base_game/pack.json"
}

/**
 * @typedef {"base"} DefaultCardpackId
 */


/**
 * @typedef CardDeck
 * @property {Card[]} white
 * @property {BlackCard[]} black
 */

/**
 * @typedef WhiteCardType
 * @property {CardTextType} text
 */

/**
 * @typedef BlackCardType
 * @property {CardTextType} text
 * @property {number} slots
 */

/**
 * @typedef WhiteAndBlackCards
 * @property {WhiteCardType[]} white
 * @property {BlackCardType[]} black 
 */

/**
 * @typedef CardTextType
 * @property {String} en
 * @property {String} es
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
 * @property {WhiteAndBlackCards} cards
 */

async function isValidCardpack(path)
{
    let f1,f2;
    const pathResolved = resolve(path);
    const stat = await fs.promises.lstat(pathResolved);
    f1 = stat.isDirectory();
    if(f1)
    {
        let dircontent = await fs.promises.readdir(path);
        f2 = dircontent.indexOf("pack.json") != -1;
    }
    if(f1 && f2) return true;
    else return false;
}

export class Cardpack {
    constructor() { }

    static cardpacks = undefined;

    /**
     * Returns available cardpacks on the server
     * @returns {Promise<Object[]>}
     */
    static getCardpacks() {
        return new Promise(async (res,rej) => {
            if(this.cardpacks != undefined) 
            {
                res(this.cardpacks);
            }
            else
            {
                fs.readdir("./resources/cardpacks", async (err,files) => {
                    if(err) rej(err);
                    let cardpacks = {};
                    for(let i = 0, len = files.length; i < len; i++)
                    {
                        let file = files[i];
                        let path = resolve("./resources/cardpacks/" + file);
                        let isValid = await isValidCardpack(path)
                        if(isValid)
                        {
                            cardpacks[file] = path + "/pack.json";
                        }
                    }
                    this.cardpacks = cardpacks;
                    res(cardpacks);
                });
            }
        });
    }


    /**
     * @param {DefaultCardpackId} name Default pack name
     * @returns {Promise<CardpackType>}
     */
    static from(name) {
        return new Promise((resolve, reject) => {
            // Check if its a default cardpack
            let cardpack = this.cardpacks[name];
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