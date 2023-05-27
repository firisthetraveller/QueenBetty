import stats from "./Stats.js";

const exp = (n, lambda) => 1 - Math.exp(-lambda * n);
const expInv = (rand, lambda) => {
  let i = 0;
  while (exp(i, lambda) < rand) {
    i++;
  }
  return i;
}

class WeatherEffects {
  constructor() {
    this.queue = [];
  }

  addEffect(effect) {
    this.queue.push(effect);
  }

  trigger(targets) {
    this.queue.forEach(e => e(targets));
    this.queue = [];
  }
}

let weatherEffects = new WeatherEffects();

class Weather {
  constructor(parameter, effect) {
    this.parameter = parameter;
    this.effect = effect;
    this.arm();
  }

  arm() {
    this.countdown = expInv(Math.random(), this.parameter);
    stats.addTry("Exponential" + this.parameter, this.countdown);
  }

  tick() {
    this.countdown--;
    if (this.countdown == 0) {
      weatherEffects.addEffect(this.effect);
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

export { Catastrophe, Blessing, weatherEffects };
