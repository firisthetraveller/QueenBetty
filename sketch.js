import stats from "./components/Stats.js";
import { Card, Deck, UniformCard, CoinThrowCard, DiceCard, GeometricCard } from "./components/Card.js";
import { Catastrophe, Blessing, weatherEffects } from "./components/Weather.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));

const CARDS_AT_TURN_START = 4;

const getNextProbabilities = (matrix, current) => {
    return matrix[current]
}

const getRandomInWeightedArray = (array) => {
    let rand = Math.random();
    let res = 0;
    let i = 0;

    while (res < rand) {
        res += array[i];
        i++;
    }

    return i;
}

/**
 * All of the textures needed for a character.
 * The five parameters are the five different animation states.
 * @returns an object with all the paths
 */
const CharacterTextures = (win, loss, idle, attack, hurt) => {
    // Est-ce qu'on charge les images ici ?
    return {
        win: win,
        loss: loss,
        idle: idle,
        attack: attack,
        hurt: hurt
    }
};

const cacahueteTextures = CharacterTextures(
    "img/Cacahuete_a_gagne.svg",
    "img/Cacahuete_a_perdu.svg",
    "img/Cacahuete_en_attente.svg",
    "img/Cacahuete_attaque.svg",
    "img/Cacahuete_se_fait_attaquer.svg");

const orangeTextures = CharacterTextures(
    "img/Orange_a_gagne.svg",
    "img/Orange_a_perdu.svg",
    "img/Orange_en_attente.svg",
    "img/Orange_attaque.svg",
    "img/Orange_se_fait_attaquer.svg");

const rougeTextures = CharacterTextures(
    "img/Rouge_a_gagne.svg",
    "img/Rouge_a_perdu.svg",
    "img/Rouge_en_attente.svg",
    "img/Rouge_attaque.svg",
    "img/Rouge_se_fait_attaquer.svg");

const vertTextures = CharacterTextures(
    "img/Vert_a_gagne.svg",
    "img/Vert_a_perdu.svg",
    "img/Vert_en_attente.svg",
    "img/Vert_attaque.svg",
    "img/Vert_se_fait_attaquer.svg");

const AnimationState = {
    idle: "idle",
    win: "win",
    loss: "loss",
    attack: "attack",
    hurt: "hurt"
}

const Position = {
    right: "right",
    left: "left"
}

class Character {
    /**
     * 
     * @param {String} name 
     * @param {Position} position 
     * @param {CharacterTextures} textures 
     * @param {Number} hp 
     */
    constructor(name, position, texture, hp = 1000) {
        this.name = name;
        this.position = position;
        this.hitPoints = hp;
        this.texture = texture;
        this.deck = new Deck();
        this.animationState = AnimationState.idle;
    }

    draw() {
        let id = ((this.position === Position.left) ? "character1" : "character2");
        document.getElementById(id).innerHTML = `<img src="${this.texture[this.animationState]}" alt="">`;
    }

    /**
     * @param {Character} target 
     */
    attack(target) {
        let card = this.drawCard();
        this.animationState = AnimationState.attack;
        console.log(this.name + " uses " + card.name + "!");
        card.effect(target);
    }

    isAlive() {
        return this.hitPoints > 0;
    }

    /**
     * 
     * @param {Number} value 
     */
    takeHit(value) {
        this.hitPoints -= value;
        if (value > 0) {
            this.animationState = AnimationState.hurt;
            console.log(this.name + " takes " + value + " damage.");
        } else if (value < 0) {
            console.log(this.name + " recovers " + -value + " HP.");
        }
    }

    resetAnimationState() {
        this.animationState = AnimationState.idle;
    }

    /**
     * 
     * @param {Card} card 
     */
    addCard(card) {
        this.deck.cards.push(card);
    }

    drawCard() {
        return this.deck.drawCard();
    }

    useMarkov(matrix) {
        let probs = getNextProbabilities(matrix, this.state);
        return this.deck[getRandomInWeightedArray(probs)];
    }
}

const OrangeCharacter = (name, position) => {
    return Character(name, position, orangeTextures);
};

const CacahueteCharacter = (name, position) => {
    return Character(name, position, cacahueteTextures);
};

const VertCharacter = (name, position) => {
    return Character(name, position, vertTextures);
};

const RougeCharacter = (name, position) => {
    return Character(name, position, rougeTextures);
};

const UniformStrategy = (character) => {
    character.drawCard();
}

const MarkovStrategy = (character, matrix) => {
    character.useMarkov(matrix);
}

class Battle {
    constructor() {
        this.players = [
            new Character("Player", Position.left, cacahueteTextures),
            new Character("Bad Guy", Position.right, vertTextures)];
        this.effects = [];
    }

    setup() {
        this.players[0].addCard(CoinThrowCard(20));
        this.players[0].addCard(GeometricCard(0.8, 2));
        this.players[0].addCard(DiceCard(3));

        this.players[1].addCard(UniformCard(10, 2));

        this.effects.push(Catastrophe(0.3, 9));
        this.effects.push(Blessing(0.5, 5));
    }

    isOver() {
        return !(this.players[0].isAlive() && this.players[1].isAlive());
    }

    async drawPlayers() {
        this.players.forEach(p => p.draw());
        await sleep(1000);
    }

    draw() {
        this.players[0].deck.draw();
    }

    update() {
        if (this.players[0].isAlive() && this.players[1].isAlive()) {
            this.players[0].attack(this.players[1]);

            this.drawPlayers();
            this.players.forEach(p => p.resetAnimationState);

            if (this.players[1].isAlive()) {
                this.players[1].attack(this.players[0]);
                this.drawPlayers();
                if (!this.players[0].isAlive()) {
                    console.log("Oh no, you're dead. Refresh the page to retry.");
                    this.players[1].animationState = AnimationState.win;
                } else {

                }
            } else {
                console.log(this.players[1].name + " fell in battle.");
                this.players[0].animationState = AnimationState.win;
            }

            this.effects.forEach(e => e.tick());
            weatherEffects.trigger(this.players);

            console.log(this.players[0].name + ": " + this.players[0].hitPoints + " HP");
            console.log(this.players[1].name + ": " + this.players[1].hitPoints + " HP");
        }
    }
}

let battle = new Battle();

battle.setup();
console.log("Setup: OK");

while (!battle.isOver()) {
    battle.draw();
    battle.update();
}

stats.print();
