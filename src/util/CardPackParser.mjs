function stdLangCode(lang) {
    if (["es", "español", "spanish", "espanol"].includes(lang.toLowerCase())) return "es";
    else if (["en", "english", "ingles"].includes(lang.toLowerCase())) return "en";
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
                "author":pack.author,
                "name": pack.name
            },
            "cards": {}
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
        return new Promise((resolve,reject) => {
            csv()
            .fromString(this.__white_csv)
            .then(csvRowWhite => {
                csv()
                .fromString(this.__black_csv)
                .then(csvRowBlack => {
                    for (let lang of Object.keys(csvRowBlack[0])){
                        let language = stdLangCode(lang);
                        if(this.__result["cards"][language] == undefined) {
                            this.__result["cards"][language] = {
                                "white":[],
                                "black":[]
                            };
                        }

                        csvRowBlack.forEach(row => {
                            this.__result.cards[language].black.push(row[lang]);
                        });
                    }

                    for (let lang of Object.keys(csvRowWhite[0])){
                        let language = stdLangCode(lang);
                        if(this.__result["cards"][language] == undefined) {
                            this.__result["cards"][language] = {
                                "white":[],
                                "black":[]
                            };
                        }

                        csvRowWhite.forEach(row => {
                            this.__result.cards[language].white.push(row[lang]);
                        });
                    }

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
    getCards(lang,type) {
        if(!type) {
            return this.__result[lang];
        } else {
            return this.__result[lang][type];
        }
    }

}