import React from 'react';

import { DIRECTION, ACTION } from '../shared/constants.js';
import { getHealthColorByPercentage } from '../shared/UnitUtils';
import Position from '../shared/Position';
import UnitImage from './Unit/UnitImage.tsx';
import Particle from './Unit/Particle';
import IsDraggable from './Unit/IsDraggable';

const GAMEBOARD_HEIGHT = 8;
const GAMEBOARD_WIDTH = 8;
const ONE_CELL_HEIGHT = 64;

let particleUID = 0; // maybe stupied way, please review @Jacek
export default class Unit extends React.Component {
  constructor(props) {
    super(props);

    const { unit } = props;
    const { x, y, id, key } = unit;
    const { top, left } = this.getPositionFromCoordinates(parseInt(x, 10), parseInt(y, 10));

    this.ref = React.createRef();
    this.state = {
      top,
      left,
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      id,
      key,
      direction: unit.team ? DIRECTION.NORTH : DIRECTION.SOUTH,
      isMoving: false,
      attackRange: unit.attackRange, // maybe consider using 'stats': unit
      particles: [],

      maxMana: unit.maxMana,
      mana: 0,

      maxHealth: unit.maxHealth,
      health: unit.maxHealth
    };
  }

  componentDidMount() {
    console.log('component mount', this.id, this.key);
    this.props.onLifecycle({
      type: 'SPAWN',
      component: this
    });
  }

  componentWillUnmount() {
    console.log('component destroy', this.id, this.key);
    this.props.onLifecycle({
      type: 'DESTROY',
      component: this
    });
  }

  get id() {
    return this.state.id;
  }

  get key() {
    return this.state.key;
  }

  get startingPosition() {
    const { unit } = this.props;
    return new Position(unit.x, unit.y);
  }

  /**
   *
   * @param {Object} action Action happened
   * @param {Boolean} isTarget Is current unit being a target for this action?
   */
  onAction(action) {
    const { payload } = action;
    switch (action.type) {
      case ACTION.MOVE: {
        if (payload.to) {
          this.move(payload.to.x, payload.to.y);
        }
        break;
      }
      case ACTION.ATTACK: {
        payload.to && this.attack(payload.to.x, payload.to.y);
        break;
      }
      case ACTION.HEALTH_CHANGE: {
        setTimeout(() => {
          this.healthChange(payload.value);
        }, 0); // todo get rid of timeout
        break;
      }
      case ACTION.MANA_CHANGE: {
        this.manaChange(payload.value);
        break;
      }
      default: {
        break;
      }
    }
  }

  getPositionFromCoordinates(x, y) {
    const { getBoardBoundingClientRect } = this.props;
    const boundingClientRec = getBoardBoundingClientRect();
    return {
      top: (boundingClientRec.height - ONE_CELL_HEIGHT) - ((y * boundingClientRec.height) / GAMEBOARD_HEIGHT) - ONE_CELL_HEIGHT,
      left: (x * boundingClientRec.width) / GAMEBOARD_WIDTH
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
      transition: !options.instant ? `transform ${unit.actionDelay / 1000}s linear` : 'auto',
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
        const { effect } = this.props.unit.attack;
        particleUID += 1;
        this.setState({
          particles: [
            ...this.state.particles,
            {
              id: particleUID,
              lookType: effect.id,
              duration: effect.duration,
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

  manaChange(value) {
    let { mana } = this.state;
    const { maxMana } = this.state;
    mana = Math.max(0, Math.min(mana + value, maxMana));
    this.setState({ mana });
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
      return <Particle key={particle.id} particle={particle} />;
    });
  }

  render() {
    const { top, left, transition, health, maxHealth, mana, maxMana, isDead, direction, isMoving } = this.state;
    if (isDead) return null;

    const { unit } = this.props;
    return (
      <div
        ref={this.ref}
        style={{
          // TODO pointerEvent:none when in battle
          height: '64px',
          left: 0,
          position: 'absolute',
          top: 0,
          transform: `translate3d(${left}px, ${top}px, 0px)`,
          transition,
          width: '64px',
          zIndex: 9999
        }}
      >
        <IsDraggable cellPosition={this.startingPosition}>
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
