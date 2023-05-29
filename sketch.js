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

/**
 * 
 * @param {Number} e espérance
 * @param {Number} s écart-type
 * @returns 
 */
function gauss(e, s) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z0 * s + e;
}

/**
 * https://fr.wikipedia.org/wiki/Loi_de_Laplace_(probabilités)
 * @param {Number} mu Décalage du pic
 * @param {Number} b Intensité
 * @returns 
 */
// function laplace(mu, b) {
//     const x = Math.random();
//     return (1 / (2 * b)) * Math.exp(-(Math.abs(x - mu)) / b);
// }

function laplace(mu, b) {
    const u = Math.random() - 0.5; // Generate a random number between -0.5 and 0.5
    return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u)) + mu;
}

/**
 * 
 * @param {Integer} n 
 * @returns n!
 */
function factorial(n) {
    if (n < 0) return 0;
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

/**
 * 
 * @param {Integer} k 
 * @param {*} lambda 
 * @returns 
 */
function poisson(k, lambda) {
    return Math.pow(lambda, k) * Math.exp(- lambda) / factorial(k);
}

function estimationPoisson(lambda) {
    const x = Math.random();
    let cumulative = 0;
    let k = 0;

    while (cumulative < x) {
        cumulative += poisson(k, lambda);
        k++;
    }

    return k;
}

function stringToBeta(s, a, b) {
    let characters = s.split("");
    return characters.map(c => {
        let rand = beta(a, b);
        // original font-size: 14

        return `<span style="font-size: ${Math.floor(rand * 14) + 1}px">${c}</span>`;
    }).join("");
}

const HP_MAX = 1000;
const PARAMETERS = {
    "Beta alpha": 0.5,
    "Beta beta": 0.5,
    "Poisson": 6,
    "Gauss moyenne": 0,
    "Gauss écart-type": 2,
    "Laplace mu": 20,
    "Laplace b": 5
}

const snakeCase = string => {
    return string.replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
};

function displayTinySlider(value, id) {
    return (
        `<input type="range" min="0" max="1" step="0.1" value="${value}" class="slider" id="${id}"></input>`
    );
}

function displaySmallSlider(value, id) {
    return (
        `<input type="range" min="0" max="10" value="${value}" class="slider" id="${id}"></input>`
    );
}

function displayBigSlider(value, id) {
    return (
        `<input type="range" min="0" max="40" value="${value}" class="slider" id="${id}"></input>`
    );
}

function displaySliders() {
    let slidersString = Object.keys(PARAMETERS).map(k => {
        let str = `<label for="myRange-${snakeCase(k)} ">${k} :</label>`;
        switch (k) {
            case "Beta alpha": case "Beta beta": str += `${displayTinySlider(PARAMETERS[k], `myRange-${snakeCase(k)}`)}`; break;
            case "Laplace mu": str += `${displayBigSlider(PARAMETERS[k], `myRange-${snakeCase(k)}`)}`; break;
            default: str += `${displaySmallSlider(PARAMETERS[k], `myRange-${snakeCase(k)}`)}`
        }
        return str + "<br>";
    }).join("\n");
    document.querySelector(".slidecontainer").innerHTML = (
        `<p>Gérez vous même les paramètres de lois !</p>
        ${slidersString}`
    );
}

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

    return i - 1;
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

const UniformMarkov = (n) => {
    const tmp = [];
    for (let i = 0; i < n; i++) {
        tmp.push([]);
        for (let j = 0; j < n; j++) {
            tmp[i].push((1 / n));
        }
        console.log(tmp[i]);
    }
    return tmp;
};

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
        this.matrix = [];
        this.state = 0;
    }

    draw() {
        let id = ((this.position === Position.left) ? "character1" : "character2");

        document.getElementById(id).innerHTML = `<img src="${this.textures[this.animationState]}" alt="" >`;
    }

    showEnd() {
        this.animationState = (this.isAlive()) ? AnimationState.win : AnimationState.loss;
    }

    drawLife() {
        let id = ((this.position === Position.left) ? "p1_life" : "p2_life");
        let ratio = Math.floor(Math.max(0, this.hitPoints) * 100 / HP_MAX);
        let error = ratio + Math.floor(3 * gauss(PARAMETERS['Gauss moyenne'], PARAMETERS['Gauss écart-type']));
        let color = ((error < 0) ? "background-color: red; " : "");
        let code = `<div class="life-bar" style="width: ${Math.abs(error)}%; ${color} ${((this.position === Position.left) ? ("left: " + (100 - ratio) + " %; ") : "")}" ></div>
        <span class="life-text">${ratio}% | Colored: ${error}%</span>`
        document.getElementById(id).innerHTML = code;
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
        if (this.matrix.length === 0) {
            this.matrix = UniformMarkov(this.deck.cards.length);
        }
        return this.useMarkov();
    }

    setMarkov(matrix) {
        this.matrix = matrix;
    }

    useMarkov() {
        console.log(this.matrix);
        let probs = getNextProbabilities(this.matrix, this.state);
        let nextCardIndex = getRandomInWeightedArray(probs);
        this.state = nextCardIndex;
        return this.deck.cards[nextCardIndex];
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
                <p>${stringToBeta(this.description, PARAMETERS['Beta alpha'], PARAMETERS['Beta beta'])}</p>
            </div >`
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

/**
 * Named after Bullet Seed, an attack from Pokémon.
 * It repeats 2-5 times the same attack, according to a custom distribution.
 * @param {Array<Number>} parameters an array of values which total sum 
 * @param {Number} damage 
 */
const BulletCard = (parameters, damage) => {
    let check = parameters.reduce((a, b) => a + b, 0);
    if (check != 1) {
        console.error("Bullet card doesn't have a correct sum of probabilities: " + check);
        throw "Illegal argument exception.";
    }

    return new Card("Bullet card", "Throw seeds at the opponent. It is guaranteed to hit but the probability to deal more damage is low. Damage: #Hits * " + damage, (target) => {
        let roll = Math.random();
        let hitCount = 0;
        let cumulative = 0;

        while (cumulative < roll) {
            cumulative += parameters[hitCount];
            hitCount++;
            target.takeHit(damage);
        }
        console.log(`Hit ${hitCount} times!`);
        stats.addTry("Bullet: " + parameters, hitCount);
    });
}

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

class Blob {
    constructor(radius) {
        this.x = Math.floor(Math.random() * window.screen.width);
        this.y = Math.floor(Math.random() * window.screen.height);
        this.radius = Math.floor(radius);
        this.opacity = 1;
    }

    draw() {
        return `<div class="blob" style="opacity: ${this.opacity}; width:${this.radius * 2}px; height: ${this.radius * 2}px; top: ${this.y}px; left: ${this.x}px;"></div>`;
    }
}

class Ink {
    constructor() {
        this.blobs = [];
        this.delay = 3;
        this.alphaTick();
    }

    remove(count) {
        for (let i = 0; i < count; i++) {
            this.blobs.shift();
        }
    }

    alphaTick() {
        for (let blob of this.blobs) {
            blob.opacity -= ((1 / (this.delay * 10)) + 0.02).toFixed(2);
        }
        this.draw();
        setTimeout(() => this.alphaTick(), this.delay * 100);
    }

    tick() {
        let eventCount = estimationPoisson(PARAMETERS['Poisson']);
        for (let i = 0; i < eventCount; i++) {
            this.blobs.push(new Blob(laplace(PARAMETERS['Laplace mu'], PARAMETERS['Laplace b'])));
        }
        // In 3 seconds, remove them
        setTimeout(() => this.remove(eventCount), this.delay * 1000);
        setTimeout(() => this.tick(), 1000);
    }

    draw() {
        document.getElementById("ink").innerHTML = this.blobs.map(b => b.draw()).join("");
    }
}

class Battle {
    constructor() {
        this.players = [
            new Character("Player", Position.left, cacahueteTextures),
            new Character("Bad Guy", Position.right, vertTextures)
        ];
        this.effects = [];
        this.ink = new Ink();
    }

    setup() {
        this.players[0].addCard(CoinThrowCard(20));
        this.players[0].addCard(GeometricCard(0.8, 2));
        this.players[0].addCard(DiceCard(3));
        this.players[0].addCard(BulletCard([0, 0.375, 0.375, 0.125, 0.125], 4));

        this.players[1].addCard(CoinThrowCard(20));
        this.players[1].addCard(GeometricCard(0.8, 2));
        this.players[1].addCard(DiceCard(3));
        this.players[1].addCard(BulletCard([0, 0.375, 0.375, 0.125, 0.125], 4));
        this.players[1].setMarkov([
            [0.0, 1, 0.0, 0.0],
            [0.0, 0, 1, 0.0],
            [0.0, 0, 0.0, 1],
            [1, 0, 0.0, 0.0]
        ]);
        //this.players[1].addCard(UniformCard(10, 2));

        this.effects.push(Catastrophe(0.3, 9));
        this.effects.push(Blessing(0.5, 5));

        this.players[0].deck.draw();
        this.ink.tick();
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

    update() {
        if (!this.players[0].isAlive() && this.players[1].isAlive()) {
            return;
        }

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

    start() {
        battle.setup();
        console.log("Setup: OK");

        while (!battle.isOver()) {
            battle.update();
        }

        battle.displayLife();
        battle.showWinner();
    }
}

let battle = new Battle();

displaySliders();
battle.start();

stats.print();
