import React from 'react';
import classNames from 'classnames';

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

interface IProps {
  unit: any;
  onLifecycle: Function;
}

interface IParticle {
  speed: number,
  id: number,
  lookType: string
  from?: {
    top: number,
    left: number
  },
  to?: {
    top: number,
    left: number
  },
  onDone: Function
}

interface IState {
  x: number;
  y: number;
  id: string;
  key: string;
  direction: number;
  isMoving: boolean;
  stats: any;
  particles: Array<IParticle>;
  mana: number;
  health: number;
  unitSpriteDimensions: number;
  isLoaded: boolean;
  top: number;
  left: number;
  transition: string;
}

interface MoveOptions {
  instant?: boolean;
  direction?: number
}

export default class Unit extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const { unit } = props;
    const { x, y, id, key } = unit;
    const position = this.getPositionFromCoordinates(x, y);
    this.state = {
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      id,
      key,
      direction: unit.team ? DIRECTION.NORTH : DIRECTION.SOUTH,
      isMoving: false,

      stats: unit,
      particles: [],

      mana: 0,
      health: unit._health.max,

      unitSpriteDimensions: 64, // we will update it later after image will be loaded
      isLoaded: false,

      top: position.top,
      left: position.left,
      transition: ''
    };
  }

  componentDidMount() {
    this.props.onLifecycle({
      type: 'SPAWN',
      component: this
    });
  }

  componentWillUnmount() {
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
        payload.to && this.attack(payload.to.x, payload.to.y, payload.duration);
        break;
      }
      case ACTION.HEALTH_CHANGE: {
        this.healthChange(payload.value);
        break;
      }
      case ACTION.MANA_CHANGE: {
        this.manaChange(payload.value);
        break;
      }
      case ACTION.SPAWN: {
        this.manaChange(payload.value);
        break;
      }
      default: {
        console.warn('Unhandled action!', action)
        throw new Error('Unhandled action for Unit!');
      }
    }
  }

  getPositionFromCoordinates(x, y) {
    const spriteDims = (this.state ? this.state.unitSpriteDimensions : 64);
    const unitDimsCorrection = (ONE_CELL_HEIGHT - spriteDims) / 2;
    const top = (Math.abs(y - GAMEBOARD_HEIGHT + 1) * ONE_CELL_HEIGHT) - unitDimsCorrection;
    const left = (x * 512) / GAMEBOARD_WIDTH - unitDimsCorrection;

    return {
      top: top,
      left: left
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

  move(x, y, options: MoveOptions = {}) {
    if (!x) { x = this.state.x; }
    if (!y) { y = this.state.y; }

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

  attack(x:number, y:number, duration:number) {
    const { top: targetTop, left: targetLeft } = this.getPositionFromCoordinates(x, y);
    const { top, left } = this.state;
    const midpointTop = (targetTop + top) / 2;
    const midpointLeft = (targetLeft + left) / 2;
    this.setState({
      direction: this.getDirectionToTarget(x, y),
      isMoving: false
    });

    if (this.isMelee()) {
      this.setState({
        top: midpointTop,
        left: midpointLeft,
        transition: `transform ${duration}ms ease`
      });

      setTimeout(() => {
        this.setState({ top, left });
      }, duration);
    } else {
      const { particle } = this.props.unit.attack;

      if (!particle) {
        console.warn('No particle for range attack', this.props.unit);
        throw new Error('No particle for range attack');
      }

      particleUID += 1;
      this.setState({
        particles: [
          ...this.state.particles,
          {
            id: particleUID,
            lookType: particle.id,
            speed: duration,
            from: {
              top: top,
              left: left
            },
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
  }

  manaChange(value) {
    let { mana } = this.state;
    mana = Math.max(0, Math.min(mana + value, this.state.stats._mana.max));
    this.setState({ mana });
  }

  healthChange(value) {
    let { health, stats } = this.state;
    this.setState({
      health: Math.max(0, Math.min(health + value, stats._health.max))
    });
  }

  isMelee() {
    return this.state.stats.attack.range === 1;
  }

  isDead() {
    return this.state.health <= 0;
  }

  onUnitSpriteLoaded(unitSpriteDimensions) {
    const { x, y } = this.state;
    this.setState({
      unitSpriteDimensions,
      isLoaded: true
    }, () => {
      const { top, left } = this.getPositionFromCoordinates(x, y);
      this.setState({ top, left });
    });
  }

  renderParticles() {
    return this.state.particles.map(particle => {
      return <Particle key={particle.id} particle={particle} />;
    });
  }

  render() {
    const { top, left, transition, health, mana, direction, isMoving, stats, isLoaded } = this.state;

    if (this.isDead()) return null;

    const classes = classNames({
      'unit': true,
      'm-loading': !isLoaded,
      'm-in-battle': false // todo
    });

    const { unit } = this.props;
    return (
      <div
        className={classes}
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${left}px, ${top}px, 0px)`,
          transition,
        }}
      >
        <IsDraggable cellPosition={this.startingPosition}>
          <UnitImage
            lookType={unit.lookType}
            direction={direction}
            isMoving={isMoving}
            onUnitSpriteLoaded={this.onUnitSpriteLoaded.bind(this)}
            />
        </IsDraggable>
        {this.renderParticles()}
        <div className="unit-healthbar">
          <div
            className="unit-healthbar-fill"
            style={{
              backgroundColor: getHealthColorByPercentage((health / stats._health.max) * 100),
              right: `${21 - 20 * (health / stats._health.max)}px`
            }}
          />
        </div>
        <div
          className="unit-manabar"
        >
          <div
            className="unit-manabar-fill"
            style={{
              right: `${21 - 20 * (mana / stats._mana.max)}px`
            }}
          />
        </div>
      </div>
    );
  }
}
