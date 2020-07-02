import React from 'react';
import BattleBoardWrapper from '../ActiveGame/BattleBoardWrapper';

const MyReduxContext = () => {
  const gameboardState = {
    isActiveBattleGoing: true,
    actionStack: [
      {
        type: 'spawn',
        unitID: '5,6',
        payload: {
          unit: {
            id: '5,6',
            name: 'minotaur',
            x: 6,
            y: 2,
            teamId: 0,
            attack: {
              value: 30,
              speed: 1250,
              range: 1,
              particleID: ''
            },
            lookType: 25,
            previousStep: {
              x: 0,
              y: 1,
              resistance: 0
            },
            armor: 3,
            cost: 1,
            isTargetable: true,
            isPassive: false,
            isShopRestricted: false,
            walkingSpeed: 1000,
            _health: {
              now: 157,
              max: 450
            },
            _mana: {
              now: 70,
              max: 100,
              regen: 10
            }
          }
        },
        time: 0
      },
      {
        type: 'spawn',
        unitID: '6,7',
        payload: {
          unit: {
            id: '6,7',
            name: 'dwarf',
            x: 6,
            y: 3,
            teamId: 1,
            attack: {
              value: 25,
              speed: 1000,
              range: 1,
              particleID: ''
            },
            lookType: 69,
            previousStep: {
              x: 0,
              y: -1,
              resistance: 0
            },
            armor: 5,
            cost: 1,
            isTargetable: true,
            isPassive: false,
            isShopRestricted: false,
            walkingSpeed: 1000,
            _health: {
              now: 0,
              max: 400
            },
            _mana: {
              now: 0,
              max: 0,
              regen: 0
            }
          }
        },
        time: 0
      },
      {
        type: 'spawn',
        unitID: '4,7',
        payload: {
          unit: {
            id: '4,7',
            name: 'dwarf',
            x: 5,
            y: 3,
            teamId: 1,
            attack: {
              value: 25,
              speed: 1000,
              range: 1,
              particleID: ''
            },
            lookType: 69,
            previousStep: {
              x: 0,
              y: -1,
              resistance: 0
            },
            armor: 5,
            cost: 1,
            isTargetable: true,
            isPassive: false,
            isShopRestricted: false,
            walkingSpeed: 1000,
            _health: {
              now: 0,
              max: 400
            },
            _mana: {
              now: 0,
              max: 0,
              regen: 0
            }
          }
        },
        time: 0
      },
      {
        type: 'effect',
        unitID: '5,6',
        time: 2000,
        effects: [
          {
            id: 'poff',
            duration: 500,
            from: {
              x: 4,
              y: 7
            }
          },
          {
            id: 'poff',
            duration: 500,
            from: {
              x: 4,
              y: 6
            }
          },
          {
            id: 'poff',
            duration: 500,
            from: {
              x: 4,
              y: 5
            }
          }
        ]
      },
      {
        type: 'effect',
        unitID: '4,7',
        payload: {
          targetId: '4,7',
          timestamp: 5000
        },
        time: 3000,
        effects: [
          {
            id: 'stars',
            duration: 60000,
            from: {
              x: 4,
              y: 7
            }
          }
        ]
      }
    ],
    battleStartBoard: [
      {
        id: '4,7',
        name: 'dwarf',
        x: 4,
        y: 7,
        teamId: 1,
        attack: {
          value: 25,
          speed: 1000,
          range: 1,
          particleID: ''
        },
        lookType: 69,
        armor: 5,
        cost: 1,
        isTargetable: true,
        isPassive: false,
        isShopRestricted: false,
        walkingSpeed: 1000,
        _health: {
          now: 400,
          max: 400
        },
        _mana: {
          now: 0,
          max: 0,
          regen: 0
        }
      },
      {
        id: '5,6',
        name: 'minotaur',
        x: 5,
        y: 6,
        teamId: 0,
        attack: {
          value: 30,
          speed: 1250,
          range: 1,
          particleID: ''
        },
        lookType: 25,
        armor: 3,
        cost: 1,
        isTargetable: true,
        isPassive: false,
        isShopRestricted: false,
        walkingSpeed: 1000,
        _health: {
          now: 450,
          max: 450
        },
        _mana: {
          now: 0,
          max: 100,
          regen: 10
        }
      },
      {
        id: '6,7',
        name: 'dwarf',
        x: 6,
        y: 7,
        teamId: 1,
        attack: {
          value: 25,
          speed: 1000,
          range: 1,
          particleID: ''
        },
        lookType: 69,
        armor: 5,
        cost: 1,
        isTargetable: true,
        isPassive: false,
        isShopRestricted: false,
        walkingSpeed: 1000,
        _health: {
          now: 400,
          max: 400
        },
        _mana: {
          now: 0,
          max: 0,
          regen: 0
        }
      }
    ],
    index: -1,
    isDead: false
  };

  return <BattleBoardWrapper gameboardState={gameboardState} />;
};

const Fixture = () => {
  const battlebordwrapper = <MyReduxContext></MyReduxContext>;
  return (
    <div className="gameboard" key={Math.random() * 10}>
      <div className="gameboard-background"></div>
      <div className="gameboard-wrapper">{battlebordwrapper}</div>
    </div>
  );
};

export default <Fixture />;
