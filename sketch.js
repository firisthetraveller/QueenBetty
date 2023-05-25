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

class Character {
  /**
   * 
   * @param {String} name 
   * @param {vec2} position 
   * @param {CharacterTextures} textures 
   * @param {Number} hp 
   */
  constructor(name, position, textures, hp = 100) {
    this.name = name;
    this.position = position;
    this.hitPoints = hp;
    this.textures = textures;
    this.deck = new Deck();
  }

  draw() {
    rect(this.position.x, this.position.y, 10);
  };

  /**
   * @param {Character} target 
   */
  attack(target) {
    let card = this.drawCard();
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
      console.log(this.name + " takes " + value + " damage.");
    } else if (value < 0) {
      console.log(this.name + " recovers " + -value + " HP.");
    }
  }

  /**
   * 
   * @param {Card} card 
   */
  addCard(card) {
    this.deck.cards.push(card);
  }

  drawCard() {
    return this.deck.draw();
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

class Card {
  /**
   * 
   * @param {String} name 
   * @param {String} description 
   * @param {Image} texture
   * @param {Function} effect (target) => void. A function that applies on the target.
   */
  constructor(name, description, effect, texture) {
    this.name = name;
    this.description = description;
    this.texture = texture;
    this.effect = effect;
  }

  draw() {
    // Draw the card here
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
  return new Card("Heads or tails", "A strong attack. Accuracy: " + (parameter * 100) + "%", (target) => {
    if (Math.random() > parameter) {
      console.log("Lucky! A strong hit landed!");
      target.takeHit(damage);
    } else {
      let rand = int(Math.random() * 3);
      switch (rand) {
        case 0: console.log("Shucks! You slipped on a banana! The attack missed."); break;
        case 1: console.log("You had an urge to sneeze! A-A-Achoo! The attack missed."); break;
        case 2: console.log("The enemy swiftly dodged the attack. The attack missed."); break;
      }
    }
  });
};

const UniformCard = (maxRoll, damage) => {
  return new Card("Uniform card", "An attack for gamblers. Accuracy: 100%. Damage: #diceroll * " + damage, (target) => {
    let roll = int(Math.random() * maxRoll) + 1;
    console.log("A '" + roll + "' has been rolled.");
    target.takeHit(roll * damage);
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
        case 0: console.log(target.name + " was ready for it and dodged the attack."); break;
        case 1:
          console.log(target.name + " SDI'd so hard that he is already out of range."); break;
        default:
          console.log(target.name + " dodged the last one.");
      }
    }

    if (i > 1) {
      console.log(target.name + " took a total of " + damage * i + " damage.");
    }
  });
}

class Deck {
  constructor() {
    this.cards = [];
  }

  draw() {
    if (this.cards.length > 0) {
      let card = this.cards[int(Math.random() * this.cards.length)];
      // this.removeCard(card);
      return card;
    }
  }

  removeCard(card) {
    const index = this.cards.indexOf(card);
    if (index > -1) { // only splice array when item is found
      this.cards.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  /**
   * 
   * @param {Card} card 
   */
  remove(card) {
    this.cards.remove(card);
  }

  /**
   * 
   * @param {Hand} hand 
   */
  put(hand) {
    hand.cards.forEach(card => this.cards.push(card));
  }
};

class Hand {
  constructor() {
    this.cards = [];
  }

  /**
   * 
   * @param {Deck} from 
   */
  drawFirstTurn(from) {
    while (this.cards.length < CARDS_AT_TURN_START) {
      let card = from.draw();
      this.cards.push(card);
    }
  }

  clear(deck) {
    deck.put(this);
    this.cards = [];
  }
};

let WeatherQueue = [];

const exp = (n, lambda) => 1 - Math.exp(-lambda * n);
const expInv = (rand, lambda) => {
  let i = 0;
  while (exp(i, lambda) < rand) {
    i++;
  }
  return i;
}

class Weather {
  constructor(parameter, effect) {
    this.parameter = parameter;
    this.effect = effect;
    this.arm();
  }

  arm() {
    this.countdown = expInv(Math.random(), this.parameter);
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
  }
  );
};

class Battle {
  constructor() {
    this.player1 = new Character("Player", { x: 30, y: 200 });
    this.player2 = new Character("Bad Guy", { x: 360, y: 200 });
    this.effects = [];
  }

  setup() {
    this.player1.addCard(CoinThrowCard(20));
    this.player1.addCard(GeometricCard(0.8, 2));
    this.player1.addCard(DiceCard(3));

    this.player2.addCard(UniformCard(10, 2));

    this.effects.push(Catastrophe(0.3, 9));
    this.effects.push(Blessing(0.5, 5));
  }

  draw() {
    //this.player1.draw();
    //this.player2.draw();
  }

  update() {
    if (this.player1.isAlive() && this.player2.isAlive()) {
      this.player1.attack(this.player2);
      if (this.player2.isAlive()) {
        this.player2.attack(this.player1);
        if (!this.player1.isAlive()) {
          console.log("Oh no, you're dead. Refresh the page to retry.");
        }
      } else {
        console.log(this.player2.name + " fell in battle.");
      }

      this.effects.forEach(e => e.tick());
      WeatherQueue.forEach(e => e([this.player1, this.player2]));
      WeatherQueue = [];

      console.log(this.player1.name + ": " + this.player1.hitPoints + " HP");
      console.log(this.player2.name + ": " + this.player2.hitPoints + " HP");
    }
  }
}

let battle = new Battle();

function setup() {
  //createCanvas(400, 400);
  battle.setup();
  console.log("Setup: OK");
}

function draw() {
  background(220);

  battle.draw();
  battle.update();
}
