import BlackCard from "./BlackCard.mjs";
import Card from "./Card.mjs";
import { Cardpack } from "./Cardpack.mjs";

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

export default class Lobby {
    constructor() {
        this.__cardPacks = new Map();
    }


    /**
     * @return {Map<String,import("./Cardpack.mjs").CardpackType>}
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
                    if (this.__cardPacks.has(pack.pack_info.id)) {
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
     * @returns {Promise<import("./Cardpack.mjs").CardpackType>}
     */
    joinCardpacks() {
        return new Promise((resolve, reject) => {
            let lastId = 0;
            let result = {
                "pack_info": {
                    "id": "",
                    "author": "",
                    "name": {
                        "es": "",
                        "en": ""
                    }
                },
                "cards": {
                    "white": [],
                    "black": []
                }
            };
            this.cardPacks.forEach(cardpack => {
                let cards = cardpack.cards;
                // Temporal
                shuffleArray(cards.black);
                shuffleArray(cards.white);
                
                cards.white.forEach(card => {
                    result.cards.white.push(new Card(++lastId,card));
                });

                cards.black.forEach(card => {
                    result.cards.black.push(new BlackCard(++lastId,card.text, card.slots));
                });




            });
            resolve(result);
        })
    }
}