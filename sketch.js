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
   * 
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

  takeHit(value) {
    if (value > 0) {
      this.hitPoints -= value;
      console.log(this.name + " takes " + value + " damage.");
      if (!this.isAlive()) {
        console.log(this.name + " fell in battle.");
      }
    }
  }

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

const enemyBaseAttackCard = new Card("Base attack", "-", (target) => target.takeHit(10));
const baseAttackCard = new Card("Base attack", "-", (target) => target.takeHit(10));
const headTailsAttackCard = new Card("Heads or tails", "Strong attack. Accuracy: 50%", (target) => {
  if (Math.random() > 0.5) {
    console.log("Lucky! A strong hit landed!");
    target.takeHit(20);
  } else {
    let rand = int(Math.random() * 3);
    switch (rand) {
      case 0: console.log("Shucks! You slipped on a banana!"); break;
      case 1: console.log("You had an urge to sneeze! A-A-Achoo!"); break;
      case 2: console.log("The enemy barely dodged the attack."); break;
    }
    target.takeHit(3);
  }
});
const geometricAttackCard = new Card("Geometric card", "A flurry of attacks, ending when an attack misses. Accuracy: 80%", (target) => {
  let i = 0;
  while (Math.random() > 0.2) {
    target.takeHit(4);
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
});

let player = new Character("Player", { x: 30, y: 200 });
let enemy = new Character("Bad Guy", { x: 360, y: 200 }, 20);

player.addCard(baseAttackCard);
player.addCard(headTailsAttackCard);
player.addCard(geometricAttackCard);

enemy.addCard(enemyBaseAttackCard);

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  player.draw();
  enemy.draw();

  if (player.isAlive() && enemy.isAlive()) {
    player.attack(enemy);
    if (enemy.isAlive()) {
      enemy.attack(player);
    }

    console.log("Player: " + player.hitPoints);
    console.log("Enemy: " + enemy.hitPoints);
  }
}
