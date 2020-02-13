import React from 'react';
import classNames from 'classnames';

import { DIRECTION, ACTION } from '../shared/constants.js';
import { getHealthColorByPercentage } from '../shared/UnitUtils';
import Position from '../shared/Position';
import UnitImage from './Unit/UnitImage.tsx';
import IsDraggable from './Unit/IsDraggable';
import EffectsWrapper from './Unit/EffectsWrapper';
import Effect_C from './Unit/Effect_C';
import Text_C from './Unit/Text_C';

const GAMEBOARD_HEIGHT = 8;
const GAMEBOARD_WIDTH = 8;
const ONE_CELL_HEIGHT = 64;

interface IState {
  x: number;
  y: number;
  id: string;
  key: string;
  direction: number;
  isMoving: boolean;
  stats: any;
  effects: Array<Effect_C|Text_C>;
  mana: number;
  health: number;
  unitSpriteDimensions: number;
  isLoaded: boolean;
  top: number;
  left: number;
  transition: string;
}

interface IProps {
  unit: any;
  onLifecycle: Function;
}

interface MoveOptions {
  instant?: boolean;
  direction?: number;
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
      effects: [],

      mana: 0,
      health: unit._health.max,

      unitSpriteDimensions: 64, // we will update it later after image will be loaded (todo check, we seems alrdy got this instantly)
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
    const { payload, effects } = action;

    if (effects && effects.length) {
      effects.forEach(e => {
        const { top, left } = this.getPositionFromCoordinates(e.from.x, e.from.y);
        this.addEffect(
          new Effect_C({
            lookType: e.id,
            speed: e.duration,
            from: {
              top: top,
              left: left
            }
          })
        );
      });
    }

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
        setTimeout(() => {
          this.healthChange(payload.value);
        }, 0); // todo get rid of timeout
        break;
      }
      case ACTION.MANA_CHANGE: {
        this.manaChange(payload.value);
        break;
      }
      case ACTION.SPAWN: {
        break;
      }
      default: {
        console.warn('Unhandled action!', action);
        throw new Error('Unhandled action for Unit!');
      }
    }
  }

  getPositionFromCoordinates(x, y) {
    const spriteDims = this.state ? this.state.unitSpriteDimensions : 64;
    const unitDimsCorrection = (ONE_CELL_HEIGHT - spriteDims) / 2;
    const top = Math.abs(y - GAMEBOARD_HEIGHT + 1) * ONE_CELL_HEIGHT - unitDimsCorrection;
    const left = (x * 512) / GAMEBOARD_WIDTH - unitDimsCorrection;

    return {
      top: top,
      left: left
    };
  }

  getDirectionToTarget(x, y) {
    // Will need changing once creatures have more complex moves
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
    if (!x) {
      x = this.state.x;
    }
    if (!y) {
      y = this.state.y;
    }

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

  onEffectDone(effectID) {
    this.setState({
      effects: [...this.state.effects].filter(effect => effect.id !== effectID)
    });
  }

  attack(x: number, y: number, duration: number) {
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
        //Recalculate position instead of passing {top, left} since there is a possibility unit should not return to the same position it started the attack from due to ongoing animations and whatnot
        this.setState({ ...this.getPositionFromCoordinates(this.state.x, this.state.y) });
      }, duration);
    } else {
      const { particle } = this.props.unit.attack;

      if (!particle) {
        console.warn('No particle for range attack', this.props.unit);
        throw new Error('No particle for range attack');
      }

      this.addEffect(
        new Effect_C({
          lookType: particle.id,
          speed: duration,
          from: {
            top: top,
            left: left
          },
          to: {
            top: midpointTop - top,
            left: midpointLeft - left
          }
        })
      );
    }
  }

  addEffect(effect: Effect_C | Text_C) {
    this.setState({
      effects: [...this.state.effects, effect]
    });
  }

  manaChange(value) {
    let { mana, stats } = this.state;
    this.setState({
      mana: Math.max(0, Math.min(mana + value, stats._mana.max))
    });
  }

  healthChange(value) {
    let { health, stats } = this.state;
    this.setState({
      health: Math.max(0, Math.min(health + value, stats._health.max))
    }, () => this.addEffect(
      new Text_C({
        text: value
      })
    ));
  }

  isMelee() {
    return this.state.stats.attack.range === 1;
  }

  isDead() {
    return this.state.health <= 0;
  }

  onUnitSpriteLoaded(unitSpriteDimensions) {
    const { x, y } = this.state;
    this.setState(
      {
        unitSpriteDimensions,
        isLoaded: true
      },
      () => {
        const { top, left } = this.getPositionFromCoordinates(x, y);
        this.setState({ top, left });
      }
    );
  }

  render() {
    const { top, left, transition, health, mana, direction, isMoving, stats, isLoaded } = this.state;
    if (this.isDead()) return null;

    const classes = classNames({
      unit: true,
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
          transition
        }}
      >
        <IsDraggable cellPosition={this.startingPosition}>
          <UnitImage lookType={unit.lookType} direction={direction} isMoving={isMoving} onUnitSpriteLoaded={this.onUnitSpriteLoaded.bind(this)} />
        </IsDraggable>
        <EffectsWrapper effects={this.state.effects} onEffectDone={this.onEffectDone.bind(this)} />
        <div className="unit-healthbar">
          <div
            className="unit-healthbar-fill"
            style={{
              backgroundColor: getHealthColorByPercentage((health / stats._health.max) * 100),
              right: `${21 - 20 * (health / stats._health.max)}px`
            }}
          />
        </div>
        <div className="unit-manabar">
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
