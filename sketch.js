class Character {
  constructor(name, position, hp = 100) {
    this.name = name;
    this.position = position;
    this.hitPoints = hp;
    this.deck = new Deck();
  }

  draw = () => {
    rect(this.position.x, this.position.y, 10);
  };

  /**
   * @param {Character} target 
   */
  attack(target) {
    let card = this.drawCard();
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
}

class Card {
  constructor(name, description, effect) {
    this.name = name;
    this.description = description;
    this.effect = effect;
  }
}

class BaseAttackCard extends Card {
  /**
   * 
   * @param {Number} damage 
   */
  constructor(damage) {
    super("Base attack", "A simple attack.", (target) => target.takeHit(damage));
  }
}

class BernoulliCard extends Card {
  /**
   * 
   * @param {Number} parameter The probability of success for each hit
   * @param {Number} damage The damage dealt on each hit
   */
  constructor(parameter, damage) {
    super("Heads or tails", "A strong attack. Accuracy: " + (parameter * 100) + "%", (target) => {
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
  }
}

class CoinThrowCard extends BernoulliCard {
  /**
   * 
   * @param {String} name
   * @param {Number} damage The damage dealt on each hit
   */
  constructor(name, damage) {
    super(name, 0.5, damage);
  }
}

class GeometryCard extends Card {
  /**
   * 
   * @param {Number} parameter The probability of success for each hit
   * @param {Number} damage The damage dealt on each hit
   */
  constructor(parameter, damage) {
    super("Geometric card", "A flurry of attacks, ending when an attack misses. Accuracy: " + (parameter * 100) + "%", (target) => {
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
}

class Deck {
  constructor() {
    this.cards = [];
  }

  draw() {
    if (this.cards.length > 0) {
      return this.cards[int(Math.random() * this.cards.length)]
    }
  }
}

class Game {
  constructor() {
    this.player1 = new Character("Player", { x: 30, y: 200 });
    this.player2 = new Character("Bad Guy", { x: 360, y: 200 });
  }

  setup() {
    this.player1.addCard(new BaseAttackCard(10));
    this.player1.addCard(new CoinThrowCard(20));
    this.player1.addCard(new GeometryCard(0.8, 4));

    this.player2.addCard(new BaseAttackCard(10));
  }

  draw() {
    this.player1.draw();
    this.player2.draw();
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

let game = new Game();

function setup() {
  createCanvas(400, 400);
  game.setup();
}

function draw() {
  background(220);

  game.draw();
  game.update();
}
