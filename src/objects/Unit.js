import React from 'react';

import { DIRECTION, ACTION } from '../shared/constants';
import { getHealthColorByPercentage } from '../shared/UnitUtils';
import Position from '../shared/Position';
import UnitImage from './Unit/UnitImage';
import Particle from './Unit/Particle';
import IsDraggable from './Unit/IsDraggable';

let particleUID = 0; // maybe stupied way, please review @Jacek
export default class Unit extends React.Component {
  constructor(props) {
    super(props);

    const { unit } = props;
    const { x, y } = unit;
    const { top, left } = this.getPositionFromCoordinates(parseInt(x, 10), parseInt(y, 10));

    this.state = {
      top,
      left,
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      initPosition: {
        x: parseInt(x, 10),
        y: parseInt(y, 10)
      },
      direction: unit.team ? DIRECTION.NORTH : DIRECTION.SOUTH,
      isMoving: false,
      attackRange: unit.attackRange, // maybe consider using 'stats': unit
      particles: [],

      maxMana: unit.maxMana,
      mana: 0,

      maxHealth: unit.hp,
      health: unit.hp,

      // Regeneration internal
      previousActionTimestamp: Date.now()
    };

    props.onLifecycle({
      type: 'SPAWN',
      unit: this
    });
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.props.onLifecycle({
      type: 'DESTROY',
      unit: this
    });
  }

  get id() {
    const { initPosition } = this.state;
    return `${initPosition.x},${initPosition.y}`;
  }

  /**
   *
   * @param {Object} action Action happened
   * @param {Boolean} isTarget Is current unit being a target for this action?
   */
  onAction(action) {
    // Regen same as on backend, maybe we could avoid code dublicating somehow
    const { mana, maxMana, health, maxHealth, previousActionTimestamp } = this.state;
    const { manaRegen, healthRegen } = this.props.unit;
    const elapsedMilliseconds = Date.now() - previousActionTimestamp;
    this.setState({
      previousActionTimestamp: Date.now(),
      mana: Math.max(0, Math.min(maxMana, mana + (manaRegen * elapsedMilliseconds) / 1000)),
      health: Math.max(0, Math.min(maxHealth, health + (healthRegen * elapsedMilliseconds) / 1000))
    });

    switch (action.type) {
      case ACTION.MOVE: {
        if (action.to) {
          this.move(action.to.x, action.to.y);
        }
        break;
      }
      case ACTION.ATTACK: {
        action.to && this.attack(action.to.x, action.to.y, action.damage);
        break;
      }
      case ACTION.CAST: {
        console.log('CAST!');
        this.cast();
        break;
      }
      case ACTION.HEALTH_CHANGE: {
        setTimeout(() => {
          this.healthChange(action.value);
        }, 500);
        break;
      }
      default: {
        break;
      }
    }
  }

  getPositionFromCoordinates(x, y) {
    const { getBoardBoundingClientRect, gameBoardWidth, gameBoardHeight } = this.props;
    const boundingClientRec = getBoardBoundingClientRect();
    return {
      top: ((gameBoardHeight - y - 1) * boundingClientRec.height) / gameBoardHeight,
      left: (x * boundingClientRec.width) / gameBoardWidth
    };
  }

  getDirectionToTarget(x, y) {
    //Will need changing once creatures have more complex moves
    const { x: currentX, y: currentY, direction } = this.state;
    if (x > currentX) {
      return DIRECTION.WEST;
    } else if (x < currentX) {
      return DIRECTION.EAST;
    } else if (y > currentY) {
      return DIRECTION.SOUTH;
    } else if (y < currentY) {
      return DIRECTION.NORTH;
    }
    return direction;
  }

  /**
   * @class MoveOptions
   * @typedef {Object} MoveOptions
   * @property {Boolean} instant
   * @property {Direction} direction
   */
  /**
   * @param {Integer} x
   * @param {Integer} y
   * @param {MoveOptions} options
   * @memberof Unit
   */
  move(x, y, options = {}) {
    const { top, left } = this.getPositionFromCoordinates(x, y);
    const { unit } = this.props;

    this.setState({
      x,
      y,
      top,
      left,
      transition: !options.instant ? `transform ${unit.speed / 1000}s linear` : 'auto',
      direction: options.direction || this.getDirectionToTarget(x, y),
      isMoving: !options.instant ? true : false
    });
  }

  attack(x, y) {
    const { top: targetTop, left: targetLeft } = this.getPositionFromCoordinates(x, y);
    const { top, left } = this.state;
    const midpointTop = (targetTop + top) / 2;
    const midpointLeft = (targetLeft + left) / 2;
    this.setState({
      direction: this.getDirectionToTarget(x, y),
      isMoving: false
    });

    setTimeout(() => {
      if (this.isMelee()) {
        this.setState({
          top: midpointTop,
          left: midpointLeft,
          transition: 'transform 0.1s ease'
        });
        setTimeout(() => {
          this.setState({ top, left });
        }, 100);
      } else {
        particleUID += 1;
        this.setState({
          particles: [
            ...this.state.particles,
            {
              id: particleUID,
              lookType: this.props.unit.particle,
              duration: 100,
              to: {
                top: midpointTop - top,
                left: midpointLeft - left
              },
              onDone: unitsParticles => {
                this.setState({
                  particles: [...this.state.particles].filter(particle => particle.id !== unitsParticles)
                });
              }
            }
          ]
        });
      }
    }, 500); // todo better than constant delay
  }

  cast() {
    this.setState({ mana: 0 });
  }

  healthChange(value) {
    let { health } = this.state;
    const { maxHealth } = this.state;
    health = Math.max(0, Math.min(health + value, maxHealth));
    this.setState({
      health,
      isDead: health <= 0
    });
  }

  isMelee() {
    return this.state.attackRange === 1;
  }

  renderParticles() {
    return this.state.particles.map(particle => {
      // const classes = classNames({
      //   square: true,
      //   red: square.red,
      // });

      return <Particle key={particle.id} className={'particle'} particle={particle} />;
    });
  }

  render() {
    const { top, left, transition, health, maxHealth, mana, maxMana, isDead, direction, isMoving } = this.state;
    if (isDead) return null;

    const { unit } = this.props;
    return (
      <div
        style={{
          // TODO pointerEvent:none when in battle
          height: '64px',
          width: '64px',
          position: 'absolute',
          transition,
          top: 0,
          left: 0,
          transform: `translate3d(${left}px, ${top}px, 0px)`,
          zIndex: 9999
        }}
      >
        <IsDraggable cellPosition={new Position(this.state.initPosition)}>
          <UnitImage lookType={unit.lookType} direction={direction} isMoving={isMoving} />
        </IsDraggable>
        {this.renderParticles()}
        <div
          className="healthbar"
          style={{
            position: 'absolute',
            backgroundColor: '#000000',
            height: '4px',
            width: '22px',
            bottom: '35px',
            right: '5px'
          }}
        >
          <div
            className="healthbar-fill"
            style={{
              position: 'absolute',
              backgroundColor: getHealthColorByPercentage((health / maxHealth) * 100),
              height: '2px',
              top: '1px',
              left: '1px',
              right: `${21 - 20 * (health / maxHealth)}px`
            }}
          />
        </div>
        <div
          className="manabar"
          style={{
            position: 'absolute',
            backgroundColor: '#000000',
            height: '4px',
            width: '22px',
            bottom: '32px',
            right: '5px'
          }}
        >
          <div
            className="manabar-fill"
            style={{
              position: 'absolute',
              backgroundColor: '#1b30cf',
              height: '2px',
              top: '1px',
              left: '1px',
              right: `${21 - 20 * (mana / maxMana)}px`
            }}
          />
        </div>
      </div>
    );
  }
}
