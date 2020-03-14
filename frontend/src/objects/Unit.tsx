import React from 'react';
import classNames from 'classnames';

import { IState, IProps, MoveOptions } from './Unit';

import { DIRECTION, ACTION } from '../shared/constants.js';
import { getHealthColorByPercentage } from '../shared/UnitUtils';
import Position from '../shared/Position';
import UnitImage from './Unit/UnitImage';
import IsDraggable from './Unit/IsDraggable';
import EffectsWrapper from './Unit/EffectsWrapper';
import EffectsFactory from './Unit/EffectsFactory';

const GAMEBOARD_HEIGHT = 8;
const GAMEBOARD_WIDTH = 8;
const ONE_CELL_HEIGHT = 64;

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
      transition: '',

      isDead: false
    };
  }

  componentDidMount() {
    this.props.onLifecycle({
      type: 'SPAWN',
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
        this.addEffect(EffectsFactory.create('effect', {
          ...e,
          from: {
            top,
            left
          }
        }));
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
    const currentEffect = this.state.effects.filter(effect => effect.id === effectID)[0]; // todo object and get by key
    const effectCallback = currentEffect && currentEffect.callback;

    this.setState({
      effects: [...this.state.effects].filter(effect => effect.id !== effectID)
    }, () => {
      if (effectCallback) {
        effectCallback();
      }

      this.updateStatus()
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
      const { particle } = this.props.unit.attack; // has id and duration(?)

      if (!particle) {
        console.warn('No particle for range attack', this.props.unit);
        throw new Error('No particle for range attack');
      }

      this.addEffect(EffectsFactory.create('particle', {
        id: particle.id,
        duration,
        from: {
          top: top,
          left: left
        },
        to: {
          top: midpointTop - top,
          left: midpointLeft - left
        }
      }));
    }
  }

  addEffect(effect) {
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
    }, () => {
      this.addEffect(EffectsFactory.create('text', {
        text: value,
        classes: value > 0 ? 'green' : 'red'
      }));
    });
  }

  componentWillUnmount() {
    this.props.onLifecycle({
      type: 'DESTROY',
      component: this
    });
  }

  updateStatus() {
    if (!this.state.isDead && this.state.health <= 0 && this.state.effects.length === 0) {
      const { top, left } = this.state;

      this.addEffect(EffectsFactory.create('effect', {
        id: 'death_effect',
        duration: 500,
        from: {
          top: top,
          left: left
        },
        callback: () => {
          this.setState({
            isDead: true
          })
        }
      }));
    }
  }

  isMelee() {
    return this.state.stats.attack.range === 1;
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
    const { top, left, transition, health, mana, direction, isMoving, stats, isLoaded, isDead } = this.state;

    if (isDead) {
      return null;
    }

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
          <UnitImage lookType={unit.lookType} direction={direction} isMoving={isMoving} extraClass={''} onUnitSpriteLoaded={this.onUnitSpriteLoaded.bind(this)} />
        </IsDraggable>
        <EffectsWrapper effects={this.state.effects} onEffectDone={this.onEffectDone.bind(this)} />
        <div className="unit-healthbar">
          <div
            className="unit-healthbar-fill"
            style={{
              backgroundColor: getHealthColorByPercentage(((health / stats._health.max) * 100), stats.teamId),
              right: `${21 - 20 * (health / stats._health.max)}px`
            }}
          />
        </div>
        <div className="unit-manabar">
          <div
            className="unit-manabar-fill"
            style={{
              right: `${21.5 - 20 * (mana / stats._mana.max)}px`
            }}
          />
        </div>
      </div>
    );
  }
}
