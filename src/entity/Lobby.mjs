import { Cardpack } from "./Cardpack.mjs";

export default class Lobby {
    constructor() {
        this.__cardPacks = new Map();
    }


    /**
     * @return {Map<String,Cardpack>}
     */
    get cardPacks() {
        return this.__cardPacks;
    }

    /**
     * @param {import("./Cardpack.mjs").DefaultCardpackId} packId
     * @returns {Promise<import("./Cardpack.mjs").CardpackType>}
     */
    addCardPack(packId) {
        return new Promise((resolve, reject) => {
            Cardpack
                .from(packId)
                .then(pack => {
                    if(this.__cardPacks.has(pack.pack_info.id)) {
                        reject(false);
                    } else {
                        this.__cardPacks.set(pack.pack_info.id, pack);
                        resolve(pack);
                    }
                })
                .catch(reject)
        })
    }

    removeCardPack(packId) {
        if (this.cardPacks.has(packId)) {
            return this.cardPacks.delete(packId);
        } else return false;
    }

    /**
     * 
     * @returns {Promise<CardpackType>}
     */
    joinCardpacks() {
        return new Promise((resolve, reject) => {
            let result = {
                "pack_info": {
                    "id": "",
                    "author": "",
                    "name": {
                        "es": "",
                        "en": ""
                    }
                },
                "cards": {}
            };
            this.cardPacks.forEach(cardpack => {
                let cards = cardpack.cards;
                let langs = Object.keys(cards);
                langs.forEach(lang => {
                    if (!result.cards[lang]) result.cards[lang] = { "white": [], "black": [] };
                    cards[lang].white.forEach(card => { result.cards[lang].white.push(card); });
                    cards[lang].black.forEach(card => { result.cards[lang].black.push(card); });
                });
            });
            resolve(result);
        })
    }
}