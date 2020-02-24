module.exports = {
  getHealthColorByPercentage(healthPercentage, teamID) {
    switch (teamID) {
      case 0: {
        if (healthPercentage >= 90) {
          return '#e024bb';
        } else if (healthPercentage >= 75 && healthPercentage < 90) {
          return '#ac2b93';
        } else if (healthPercentage >= 25 && healthPercentage < 75) {
          return '#ac2b63';
        } else if (healthPercentage >= 10 && healthPercentage < 25) {
          return '#c70707';
        } else {
          return '#ff001d';
        }
      }
      default:
      case 1: {
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
    }
  }
};