let cards = [{
        text: "Bondrewd",
        dark: false,
    },
    {
        text: "Mitty",
        dark: false,
    },
    {
        text: "Reg",
        dark: false,
    },
    {
        text: "Riko",
        dark: false,
    },
    {
        text: "McDonald's",
        dark: false,
    },
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