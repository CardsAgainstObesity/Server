let cards = [{
        text: "Barack Obama.",
        dark: false,
    },
    {
        text: "Gente blanca.",
        dark: false,
    },
    {
        text: "Los niños de la guerra.",
        dark: false,
    },
    {
        text: "Racismo.",
        dark: false,
    },
    {
        text: "Pedofilia.",
        dark: false,
    },
    {
        text: "Porno con tentáculos.",
        dark: false,
    },
    {
        text: "Nazis.",
        dark: false,
    },
    {
        text: "Pilotos kamikaze.",
        dark: false,
    },
    {
        text: "Colegios tradicionalmente negros.",
        dark: false,
    },
    {
        text: "Ocultar una erección.",
        dark: false,
    }
];

let game = {
    gamestate: "lobby",
    _card_index: 0,
    _card_values: [],
    set state(value) {
        console.log(`${this.gamestate} => ${value}`);
        this.gamestate = value;
        console.log(`New gamestate: ${this.gamestate}`);
    },
    get state() {
        console.log(`Current gamestate: ${this.gamestate}`);
        return this.gamestate;
    },
    set card_index(index){
        this._card_index = index;
    },
    get card_index(){
        return this._card_index;
    },
    appendCardValue(card_value){
        this._card_values.push(card_value);
    },
    getCardValue(index){
        return this._card_values[index];
    },
    clearCardValues(){
        this._card_values = [];
    }
}

let czar = "Tu puta madre";

export { cards, game, czar }