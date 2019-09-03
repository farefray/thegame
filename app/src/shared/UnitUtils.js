module.exports = {
  getHealthColorByPercentage(healthPercentage) {
    if (healthPercentage >= 90) {
      return 'green';
    } else if (healthPercentage >= 75 && healthPercentage < 90) {
      return '#99ff99';
    } else if (healthPercentage >= 25 && healthPercentage < 75) {
      return 'yellow';
    } else if (healthPercentage >= 10 && healthPercentage < 25) {
      return 'red';
    } else {
      return '#800000';
    }
  }
};
