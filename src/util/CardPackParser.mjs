function stdLangCode(lang) {
    if (["es", "español", "spanish", "espanol"].includes(lang)) return "es";
    else if (["en", "english", "ingles"].includes(lang)) return "en";
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
        this.__result = {};
        this.__pack = pack;
        this.__valid = false;

        this.__white_csv = white_csv;
        this.__black_csv = black_csv;

    }

    parse() {
        return new Promise((resolve,reject) => {
            csv()
            .fromString(this.__white_csv)
            .then(csvRowWhite => {
                csv()
                .fromString(this.__black_csv)
                .then(csvRowBlack => {
                    console.log(csvRowBlack,csvRowWhite);
                    resolve(csvRowBlack);
                })
            })
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
    getCards(lang,type) {
        if(!type) {
            return this.__result[lang];
        } else {
            return this.__result[lang][type];
        }
    }

}