var actionStack = [{
  "type": "spawn",
  "unitID": "3,3",
  "payload": {
    "unit": {
      "id": "3,3",
      "name": "minotaur_mage",
      "x": 3,
      "y": 4,
      "teamId": 0,
      "attack": {
        "value": 40,
        "range": 3,
        "speed": 100,
        "particleID": "fireball",
        "particle": {
          "id": "fireball",
          "speed": 750
        }
      },
      "lookType": 23,
      "previousStep": {
        "x": 0,
        "y": 1
      },
      "armor": 2,
      "_health": {
        "now": 6323,
        "max": 6500
      },
      "_mana": {
        "now": 75,
        "max": 100,
        "regen": 25
      },
      "spawned": false
    }
  },
  "time": 0
}, {
  "type": "spawn",
  "unitID": "6,6",
  "payload": {
    "unit": {
      "id": "6,6",
      "name": "dwarf_geomancer",
      "x": 6,
      "y": 5,
      "teamId": 1,
      "attack": {
        "value": 40,
        "range": 3,
        "speed": 100,
        "particleID": "fireball",
        "particle": {
          "id": "fireball",
          "speed": 750
        }
      },
      "lookType": 66,
      "previousStep": {
        "x": 0,
        "y": -1
      },
      "armor": 1,
      "_health": {
        "now": 0,
        "max": 550
      },
      "_mana": {
        "now": 80,
        "max": 100,
        "regen": 10
      },
      "spawned": false
    }
  },
  "time": 0
}, {
  "type": "move",
  "unitID": "6,6",
  "payload": {
    "from": {
      "x": 6,
      "y": 6
    },
    "to": {
      "x": 6,
      "y": 5
    }
  },
  "time": 2000
}, {
  "type": "manachange",
  "unitID": "6,6",
  "payload": {
    "value": 10
  },
  "time": 2000
}, {
  "type": "move",
  "unitID": "3,3",
  "payload": {
    "from": {
      "x": 3,
      "y": 3
    },
    "to": {
      "x": 3,
      "y": 4
    }
  },
  "time": 2000
}, {
  "type": "manachange",
  "unitID": "3,3",
  "payload": {
    "value": 25
  },
  "time": 2000
}, {
  "type": "manachange",
  "unitID": "3,3",
  "payload": {
    "value": 25
  },
  "time": 3000
}, {
  "type": "manachange",
  "unitID": "6,6",
  "payload": {
    "value": 10
  },
  "time": 3000
}, {
  "type": "attack",
  "unitID": "3,3",
  "payload": {
    "from": {
      "x": 3,
      "y": 4
    },
    "to": {
      "x": 6,
      "y": 5
    },
    "duration": 500
  },
  "time": 3200
}, {
  "type": "attack",
  "unitID": "6,6",
  "payload": {
    "from": {
      "x": 6,
      "y": 5
    },
    "to": {
      "x": 3,
      "y": 4
    },
    "duration": 500
  },
  "time": 3400
}, {
  "type": "healthchange",
  "unitID": "6,6",
  "payload": {
    "value": -40
  },
  "time": 3700
}, {
  "type": "healthchange",
  "unitID": "3,3",
  "payload": {
    "value": -32
  },
  "time": 3900
}, {
  "type": "manachange",
  "unitID": "6,6",
  "payload": {
    "value": 10
  },
  "time": 4000
}, {
  "type": "manachange",
  "unitID": "3,3",
  "payload": {
    "value": 25
  },
  "time": 4000
}, {
  "type": "attack",
  "unitID": "3,3",
  "payload": {
    "from": {
      "x": 3,
      "y": 4
    },
    "to": {
      "x": 6,
      "y": 5
    },
    "duration": 500
  },
  "time": 4400
}, {
  "type": "attack",
  "unitID": "6,6",
  "payload": {
    "from": {
      "x": 6,
      "y": 5
    },
    "to": {
      "x": 3,
      "y": 4
    },
    "duration": 500
  },
  "time": 4800
}, {
  "type": "healthchange",
  "unitID": "6,6",
  "payload": {
    "value": -35
  },
  "time": 4900
}, {
  "type": "manachange",
  "unitID": "3,3",
  "payload": {
    "value": 25
  },
  "time": 5000
}, {
  "type": "manachange",
  "unitID": "6,6",
  "payload": {
    "value": 10
  },
  "time": 5000
}, {
  "type": "healthchange",
  "unitID": "3,3",
  "payload": {
    "value": -38
  },
  "time": 5300
}, {
  "type": "manachange",
  "unitID": "3,3",
  "payload": {
    "value": -100
  },
  "time": 5600
}, {
  "type": "healthchange",
  "unitID": "6,6",
  "payload": {
    "value": -1500
  },
  "effects": [{
    "id": "thunderstorm",
    "duration": 1000,
    "from": {
      "x": 6,
      "y": 5
    }
  }],
  "time": 5600
  }];

var currentActionIndex = 0;
const nextAction = function () {
  const actionTime = actionStack[currentActionIndex].time;
  const boardActions = actionStack.filter(action => action.time === actionTime); // todo remove actions from stack instead?
  setCurrentActionIndex(currentActionIndex + boardActions.length);
}

const actionTime = actionStack[currentActionIndex].time;
const boardActions = actionStack.filter(action => action.time === actionTime);
for (const action of boardActions) {
  // reducer which executes action from stack for child Unit component
  dispatchUnitLifecycle(action);
}

if (currentActionIndex + boardActions.length >= actionStack.length) {
  // no more actions, we could trigger winning/losing animation here
} else if (!DEBUG_MODE) {
  // Scheduling next action
  const timeoutLength = actionStack[currentActionIndex + boardActions.length].time - actionTime;

  setTimeout(() => {
    nextAction()
  }, timeoutLength);
}