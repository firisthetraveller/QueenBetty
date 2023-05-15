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

const CharacterTextures = (win, loss, idle, attack, hurt) => {
  return {
    win: win,
    loss: loss,
    idle: idle,
    attack: attack,
    hurt: hurt
  }
};

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
    if (value > 0) {
      this.hitPoints -= value;
      console.log(this.name + " takes " + value + " damage.");
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

const ThinGuy = () => {
  return
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

class Weather {
  constructor(parameter, effect) {
    this.parameter = parameter;
    this.effect = effect;
  }

  occur() {
    this.effect();
  }
};

const Catastrophe = (param, damage) => {
  return new Weather(param, (target1, target2) => { target1.takeHit(damage); target2.takeHit(damage); });
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

    this.effects.push(Catastrophe())
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
