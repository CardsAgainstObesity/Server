import {resolve} from 'path';
import 'fs';
function stdLangCode(lang) {
    let langCode;
    switch (lang.toLowerCase()) {
        case "es":
        case "español":
        case "spanish":
        case "espanol":
            langCode = "es";
            break;
        case "en":
        case "english":
            langCode = "en";
            break;
        default:
            langCode = undefined;
            break;
    }
    return langCode;
}


import csv from 'csvtojson';
export default class CardPackParser {

    /**
     * Creates a parser that will
     * join data from white_csv and
     * black_csv to create a card pack.
     * @param {Object} pack Pack information
     * @param {String} white_csv Raw csv text
     * @param {String} black_csv Raw csv text
     */
    constructor(pack, white_csv, black_csv) {
        this.__pack = pack;
        this.__result = {
            "pack_info": {
                "id": pack.id,
                "author": pack.author,
                "name": pack.name
            },
            "cards": {
                "white": [],
                "black": []
            }
        }
        this.__valid = false;

        this.__white_csv = white_csv;
        this.__black_csv = black_csv;

    }

    /**
     * 
     * @returns {Promise<import('../entity/Cardpack.mjs').CardpackType>}
     */
    parse() {
        return new Promise((resolve, reject) => {
            csv()
                .fromString(this.__white_csv)
                .then(csvRowWhite => {
                    csv()
                        .fromString(this.__black_csv)
                        .then(csvRowBlack => {
                            csvRowBlack.forEach((row) => {
                                let card = {
                                    "slots": row["slots"] || 1,
                                    "text": {}
                                };
                                for (let lang of Object.keys(csvRowWhite[0])) {
                                    let language = stdLangCode(lang);
                                    if (language != undefined) {
                                        card.text[language] = row[lang];
                                    }
                                }
                                this.__result.cards.black.push(card);
                            });

                            csvRowWhite.forEach((row) => {
                                let card = {
                                    "text": {}
                                };
                                for (let lang of Object.keys(csvRowWhite[0])) {
                                    let language = stdLangCode(lang);
                                    if (language != undefined) {
                                        card.text[language] = row[lang];
                                    }
                                }
                                this.__result.cards.white.push(card);
                            });


                            resolve(this.__result);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    get valid() {
        return this.__valid;
    }
    /**
     * Gets pack information
     * @param {"en" | "es"} lang Text language 
     */
    getPackInfo(lang) {
        return this.__pack[lang];
    }

    /**
     * Gets card of the given type from the pack
     * @param {"en" | "es"} lang Card text language 
     * @param {"black" | "white"} type Card type 
     */
    getCards(lang, type) {
        if (!type) {
            return this.__result[lang];
        } else {
            return this.__result[lang][type];
        }
    }

}