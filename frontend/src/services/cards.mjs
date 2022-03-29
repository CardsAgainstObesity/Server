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
    _card: 0,
    set state(value) {
        console.log(`${this.gamestate} => ${value}`);
        this.gamestate = value;
        console.log(`New gamestate: ${this.gamestate}`);
    },
    get state() {
        console.log(`Current gamestate: ${this.gamestate}`);
        return this.gamestate;
    },
    set card(value){
        this._card = value;
    },
    get card(){
        return this._card;
    }
}

let czar = "Tu puta madre";

export { cards, game, czar }