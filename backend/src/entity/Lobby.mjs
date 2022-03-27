import Cardpack from "./Cardpack.mjs";

export default class Lobby {
    constructor() {
        this.__cardPacks = new Map();
    }

    get cardPacks() {
        return this.__cardPacks;
    }

    /**
     * @param {Cardpack} pack 
     */
    addCardPack(pack) {
        return new Promise((resolve,reject) => {
            Cardpack
            .from(pack)
            .then(pack => {
                this.__cardPacks.set(pack.name,pack);
                resolve(pack);
            })
            .catch(reject)
        })
    }

    removeCardPack(name) {
        // TODO
    }

    joinCardpacks() {
        return new Promise((resolve,reject) => {
            let result = {};
            this.cardPacks.forEach(cardpack => {
                let cards = cardpack.cards;
                let langs = Object.keys(cards);
                langs.forEach(lang => {
                    if(!result[lang]) result[lang] = {"white":[],"black":[]};
                    cards[lang].white.forEach(card => { result[lang].white.push(card); });
                    cards[lang].black.forEach(card => { result[lang].black.push(card); });
                });
            });
            resolve(result);
        })
    }
}