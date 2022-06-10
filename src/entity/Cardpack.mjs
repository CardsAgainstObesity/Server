import fs from 'fs';
import path, { resolve } from 'path';
import CardPackParser from '../util/CardPackParser.mjs';
import LoggingSystem from '../util/LoggingSystem.mjs';
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
 * @property {boolean} enabled
 */

/**
 * @typedef CardpackType
 * @property {PackInfoType} pack_info
 * @property {WhiteAndBlackCards} cards
 */

async function getCardpackType(path) {
    let isDirectory, hasPackMerged, hasToBeMerged;

    const pathResolved = resolve(path);
    const stat = await fs.promises.lstat(pathResolved);
    isDirectory = stat.isDirectory(); // Directory must exist
    if (isDirectory) {
        let dircontent = await fs.promises.readdir(path);
        // contains pack.json, easy.
        hasPackMerged = dircontent.indexOf("pack.json") != -1;
        // contains .csv, merge csv into json.
        if (!hasPackMerged) {
            let hasWhiteCSV, hasBlackCSV, hasInfoCSV;
            hasWhiteCSV = dircontent.indexOf("white_cards.csv") != -1;
            hasBlackCSV = dircontent.indexOf("black_cards.csv") != -1;
            hasInfoCSV = dircontent.indexOf("pack_info.json") != -1;
            if (hasWhiteCSV && hasBlackCSV && hasInfoCSV) {
                hasToBeMerged = true;
            }
        }
    }
    if (hasToBeMerged) return "merge"
    else if (hasPackMerged) return "pack"
    else return "invalid";
}

export class Cardpack {
    constructor() { }

    static paths = undefined;
    static cardpacks = {};

    static __load() {
        return new Promise((res, rej) => {
            this.getCardpackPaths()
                .then(paths => {
                    for (var name in paths) {
                        this.from(name)
                            .then(cardpack => {
                                if (cardpack.pack_info.enabled) {
                                    LoggingSystem.singleton.log("[Cardpack]", `Loaded cardpack ${cardpack.pack_info.id}. White: ${cardpack.cards.white.length}, Black: ${cardpack.cards.black.length}`);
                                    this.cardpacks[cardpack.pack_info.id] = cardpack;
                                }
                            })
                            .catch(err => rej(err));
                    }
                    res(true);
                });
        });
    }

    /**
     * Returns available cardpacks on the server
     * @returns {Promise<Object[]>}
     */
    static getCardpackPaths() {
        return new Promise(async (res, rej) => {
            if (this.paths != undefined) {
                res(this.paths);
            }
            else {
                fs.readdir("./resources/cardpacks", async (err, files) => {
                    if (err) rej(err);
                    let paths = {};
                    for (let i = 0, len = files.length; i < len; i++) {
                        let file = files[i];
                        let path = resolve("./resources/cardpacks/" + file);
                        let type = await getCardpackType(path);
                        if (type == "pack") paths[file] = path + "/pack.json";
                        else if (type == "merge") paths[file] = {
                            pack: path + "/pack_info.json",
                            white: path + "/white_cards.csv",
                            black: path + "/black_cards.csv"
                        }
                        else if (file != ".gitignore") LoggingSystem.singleton.log("[Cardpack]", `Couldn't resolve ${path}. Ignoring this cardpack`);
                    }
                    this.paths = paths;
                    res(paths);
                });
            }
        });
    }

    static getCardpack(name) {
        return this.cardpacks[name];
    }

    /**
     * @param {DefaultCardpackId} name Default pack name
     * @returns {Promise<CardpackType>}
     */
    static from(name) {
        return new Promise(async (res, rej) => {
            // Check if its a default cardpack
            let cardpack = this.paths == undefined ? undefined : this.paths[name];
            if (cardpack) {
                switch (typeof cardpack) {
                    case "string":
                        fs.promises.readFile(path.resolve(cardpack), {
                            encoding: "utf8"
                        })
                            .then(buffer => {
                                try {
                                    var json = JSON.parse(buffer.toString());
                                    res(json);
                                } catch (error) {
                                    rej(error);
                                }
                            })
                            .catch(console.error);
                        break;
                    case "object":
                        const packInfoRaw = await fs.promises.readFile(cardpack.pack);
                        const whiteRaw = await fs.promises.readFile(cardpack.white);
                        const blackRaw = await fs.promises.readFile(cardpack.black);
                        const parser = new CardPackParser(JSON.parse(packInfoRaw.toString()), whiteRaw.toString(), blackRaw.toString());
                        parser.parse()
                            .then(cardpack => {
                                res(cardpack);
                            })
                            .catch(err => {
                                rej(`Error while parsing ${name}. ${err}`);
                            })

                        break;

                }

            } else {
                rej("Invalid cardpack");
            }
        });
    }
}