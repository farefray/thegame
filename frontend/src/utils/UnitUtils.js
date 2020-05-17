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
      default:
      case 3: {
        if (healthPercentage >= 90) {
          return '#808080';
        } else if (healthPercentage >= 75 && healthPercentage < 90) {
          return '#909090';
        } else if (healthPercentage >= 25 && healthPercentage < 75) {
          return '#A0A0A0';
        } else if (healthPercentage >= 10 && healthPercentage < 25) {
          return '#CFCFCF';
        } else {
          return '#EFEFEF';
        }
      }
    }
  }
};