import stats from "./Stats.js"

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
                <p>${this.description}</p>
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
      stats.addTry("Bernouilli" + parameter, 1);
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
      stats.addTry("Bernouilli" + parameter, 0);
    }
  });
};

const UniformCard = (maxRoll, damage) => {
  return new Card("Uniform card", "An attack for gamblers. Accuracy: 100%. Damage: #diceroll * " + damage, (target) => {
    let roll = Math.floor(Math.random() * maxRoll) + 1;
    console.log("A '" + roll + "' has been rolled.");
    target.takeHit(roll * damage);
    stats.addTry("Uniform" + maxRoll, roll);
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
    stats.addTry("Geometric" + parameter, i);

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

export { Card, BaseAttackCard, GeometricCard, CoinThrowCard, DiceCard, BernouilliCard, UniformCard, Deck };
