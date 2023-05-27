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

const stats = new Stats();

export default stats;
