const exp = (n, lambda) => 1 - Math.exp(-lambda * n);
const expInv = (rand, lambda) => {
    let i = 0;
    while (exp(i, lambda) < rand) {
        i++;
    }
    return i;
}

function beta(alpha, beta) {
    const u = Math.random();
    const v = Math.random();

    const x = Math.pow(u, 1 / alpha);
    const y = Math.pow(v, 1 / beta);
    return x / (x + y);
}

function stringToBeta(s, a, b) {
    let characters = s.split("");
    return characters.map(c => {
        let rand = beta(a, b);
        // original font-size: 14

        return `<span style="font-size: ${Math.floor(rand * 14) + 1}px">${c}</span>`;
    }).join("");
}

const CARDS_AT_TURN_START = 4;
const HP_MAX = 1000;

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

function getAverage(values) {
    return values.reduce((res, a) => res + a, 0) / values.length;
}

function getSquaredAverage(values) {
    return values.reduce((res, a) => res + a * a, 0) / values.length;
}

function getVariance(values) {
    let average = getAverage(values);
    return getSquaredAverage(values) - average * average;
}

class Stats {
    constructor() {
        this.counts = {}
    }

    /**
     * 
     * @param {String} key 
     */
    addStat(key) {
        this.counts[key] = [];
    }

    /**
     * 
     * @param {String} key 
     * @param {Number} result
     */
    addTry(key, result) {
        if (this.counts[key] === undefined) {
            this.addStat(key);
        }

        this.counts[key].push(result);
    }

    print() {
        console.log("Stats:");

        Object.keys(this.counts).forEach(key => {
            console.log(key + " - For " + this.counts[key].length + " tries:");
            console.log("Average: " + getAverage(this.counts[key]));
            console.log("Variance: " + getVariance(this.counts[key]));
        });
    }
};

let stats = new Stats();

class Character {
    /**
     * 
     * @param {String} name 
     * @param {Position} position 
     * @param {CharacterTextures} textures 
     * @param {Number} hp 
     */
    constructor(name, position, textures, hp = HP_MAX) {
        this.name = name;
        this.position = position;
        this.hitPoints = hp;
        this.textures = textures;
        this.deck = new Deck();
        this.animationState = AnimationState.idle;
    }

    draw() {
        let id = ((this.position === Position.left) ? "character1" : "character2");

        console.log("Animation state: " + this.animationState);
        console.log("Available textures: " + this.textures);
        console.log("Image path: " + this.textures[this.animationState]);
        console.log("");
        document.getElementById(id).innerHTML = `<img src="${this.textures[this.animationState]}" alt="">`;
    }

    showEnd() {
        this.animationState = (this.isAlive()) ? AnimationState.win : AnimationState.loss;
    }

    drawLife() {
        let id = ((this.position === Position.left) ? "p1_life" : "p2_life");
        document.getElementById(id).innerHTML = `${Math.max(0, this.hitPoints)} / ${HP_MAX}`;
    }

    /**
     * @param {Character} target 
     */
    attack(target) {
        let card = this.drawCard();
        this.animationState = AnimationState.attack;
        console.log(this.name + " uses " + card.name + "!");
        console.log(card);
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

let id = 0;

const nextId = () => {
    return id++;
}

class Card {
    /**
     * 
     * @param {String} name 
     * @param {String} description 
     * @param {Image} texture
     * @param {Function} effect (target) => void. A function that applies on the target.
     */
    constructor(name, description, effect, texture) {
        this.cardId = nextId();
        this.name = name;
        this.description = description;
        this.texture = texture;
        this.effect = effect;
    }

    draw() {
        // Draw the card here
        return (
            `<div class="card" id="card-${this.cardId}">
                <h3>${this.name}</h3>
                <p>${stringToBeta(this.description, 0.5, 0.5)}</p>
            </div>`
        );
    }
}

/**
 * 
 * @param {Number} damage 
 * @returns 
 */
const BaseAttackCard = (damage) => {
    return new Card("Base attack", "A simple attack.", (target) => target.takeHit(damage));
}

/**
 * 
 * @param {Number} parameter The probability of success for each hit
 * @param {Number} damage The damage dealt on each hit
 */
const BernouilliCard = (parameter, damage) => {
    return new Card("Heads or tails", "A strong attack. Damage: " + damage + ". Accuracy: " + (parameter * 100) + "%", (target) => {
        if (Math.random() > parameter) {
            console.log("Lucky! A strong hit landed!");
            target.takeHit(damage);
            stats.addTry("Bernouilli: " + parameter, 1);
        } else {
            let rand = Math.floor(Math.random() * 3);
            switch (rand) {
                case 0:
                    console.log("Shucks! You slipped on a banana! The attack missed.");
                    break;
                case 1:
                    console.log("You had an urge to sneeze! A-A-Achoo! The attack missed.");
                    break;
                case 2:
                    console.log("The enemy swiftly dodged the attack. The attack missed.");
                    break;
            }
            stats.addTry("Bernouilli: " + parameter, 0);
        }
    });
};

const UniformCard = (maxRoll, damage) => {
    return new Card("Uniform card", "An attack for gamblers. Accuracy: 100%. Damage: #diceroll * " + damage, (target) => {
        let roll = Math.floor(Math.random() * maxRoll) + 1;
        console.log("A '" + roll + "' has been rolled.");
        target.takeHit(roll * damage);
        stats.addTry("Uniform: " + maxRoll, roll);
    });
};

const DiceCard = (damage) => {
    return UniformCard(6, damage);
}

/**
 * 
 * @param {Number} damage The damage dealt on each hit
 */
const CoinThrowCard = (damage) => {
    return BernouilliCard(0.5, damage);
}

/**
 * 
 * @param {Number} parameter The probability of success for each hit
 * @param {Number} damage The damage dealt on each hit
 */
const GeometricCard = (parameter, damage) => {
    return new Card("Geometric card", "A flurry of attacks, ending when an attack misses. Accuracy: " + (parameter * 100) + "%", (target) => {
        let i = 0;
        while (Math.random() > (1 - parameter)) {
            target.takeHit(damage);
            i++;
        }
        if (target.isAlive()) {
            switch (i) {
                case 0:
                    console.log(target.name + " was ready for it and dodged the attack.");
                    break;
                case 1:
                    console.log(target.name + " SDI'd so hard that he is already out of range.");
                    break;
                default:
                    console.log(target.name + " dodged the last one.");
            }
        }
        stats.addTry("Geometric: " + parameter, i);

        if (i > 1) {
            console.log(target.name + " took a total of " + damage * i + " damage.");
        }
    });
}

class Deck {
    constructor() {
        this.cards = [];
    }

    drawCard() {
        if (this.cards.length > 0) {
            let card = this.cards[Math.floor(Math.random() * this.cards.length)];
            return card;
        }
    }

    draw() {
        document.getElementById("cards_zone").innerHTML = this.cards.map(card => card.draw()).join("<br>");
    }
};

let WeatherQueue = [];

class Weather {
    constructor(parameter, effect) {
        this.parameter = parameter;
        this.effect = effect;
        this.arm();
    }

    arm() {
        this.countdown = expInv(Math.random(), this.parameter);
        stats.addTry("Exponential: " + this.parameter, this.countdown);
    }

    tick() {
        this.countdown--;
        if (this.countdown == 0) {
            WeatherQueue.push(this.effect);
            this.arm();
        }
    }
};

const Catastrophe = (param, value) => {
    return new Weather(param, (targets) => {
        console.error("A catastrophe occurred!");
        targets.forEach(t => t.takeHit(value));
    });
};

const Blessing = (param, value) => {
    return new Weather(param, (targets) => {
        console.error("A soothing breeze is gently caressing both players.");
        targets.forEach(t => t.takeHit(-value));
    });
};


class Battle {
    constructor() {
        this.players = [
            new Character("Player", Position.left, cacahueteTextures),
            new Character("Bad Guy", Position.right, vertTextures)
        ];
        this.effects = [];
    }

    setup() {
        this.players[0].addCard(CoinThrowCard(20));
        this.players[0].addCard(GeometricCard(0.8, 2));
        this.players[0].addCard(DiceCard(3));

        this.players[1].addCard(UniformCard(10, 2));

        this.effects.push(Catastrophe(0.3, 9));
        this.effects.push(Blessing(0.5, 5));

        this.players[0].deck.draw();
    }

    isOver() {
        return !(this.players[0].isAlive() && this.players[1].isAlive());
    }

    showWinner() {
        this.players.forEach(p => p.showEnd());
        this.drawPlayers();
    }

    displayLife() {
        this.players.forEach(p => p.drawLife());
    }

    drawPlayers() {
        this.players.forEach(p => p.draw());
    }

    async update() {
        if (this.players[0].isAlive() && this.players[1].isAlive()) {
            this.players[0].attack(this.players[1]);
            this.drawPlayers();
            this.players.forEach(p => p.resetAnimationState());

            if (!this.players[1].isAlive()) {
                document.getElementById('history').innerHTML = "Yaaaaay, you won! Refresh the page to retry.";
                return;
            }

            this.players[1].attack(this.players[0]);
            this.drawPlayers();

            if (!this.players[0].isAlive()) {
                return;
            }


            this.effects.forEach(e => e.tick());
            WeatherQueue.forEach(e => e(this.players));
            WeatherQueue = [];

            console.log(this.players[0].name + ": " + this.players[0].hitPoints + " HP");
            console.log(this.players[1].name + ": " + this.players[1].hitPoints + " HP");

            this.displayLife();
        }
    }
}

let battle = new Battle();

battle.setup();
console.log("Setup: OK");

while (!battle.isOver()) {
    battle.update();
}

battle.displayLife();
battle.showWinner();

stats.print();
