function Character(name, position, hp = 100, attack = 10) {
  const draw = () => {
    rect(position.x, position.y, 10);
  };

  function attack(target) {
    let card = this.drawCard();
    console.log(name + " uses " + card.name + "!");
    card.effect(target);
  }

  function isAlive() {
    return this.hitPoints > 0;
  }

  function takeHit(value) {
    if (value > 0) {
      this.hitPoints -= value;
      console.log(this.name + " takes " + value + "damage.");
      if (!this.isAlive()) {
        console.log(this.name + " fell in battle.");
      }
    } else {
      console.log("Lucky! " + this.name + " dodged the attack.");
    }
  }

  function addCard(card) {
    this.deck.cards.push(card);
  }

  function drawCard() {
    return this.deck.draw();
  }

  return {
    name,
    deck: Deck(),
    hitPoints: hp,
    draw,
    attack,
    isAlive,
    takeHit,
    addCard,
    drawCard
  };
}

function Card(name, description, effect) {
  return {
    name,
    description,
    effect
  }
}

function Deck() {
  let cards = [];

  function draw() {
    if (cards.length > 0) {
      return cards[int(Math.random() * cards.length)]
    }
  }

  return {
    cards,
    draw
  }
}

const enemyBaseAttackCard = Card("Base attack", "-", (target) => target.takeHit(10));
const baseAttackCard = Card("Base attack", "-", (target) => target.takeHit(10));
const headTailsAttackCard = Card("Heads or tails", "Strong attack. Accuracy: 50%", (target) => {
  (Math.random() > 0.5) ? target.takeHit(20) : target.takeHit(3);
});
const geometricAttackCard = Card("Geometric card", "A flurry of attacks, ending when an attack misses. Accuracy: 80%", (target) => {
  while (Math.random() > 0.2)
    target.takeHit(4);
  target.takeHit(0);
});

let player = Character("Player", { x: 30, y: 200 });
let enemy = Character("Bad Guy", { x: 360, y: 200 }, 20, 5);

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
  }
}
