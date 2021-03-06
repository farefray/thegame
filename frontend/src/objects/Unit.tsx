import React from 'react';
import classNames from 'classnames';

import { IState, IProps } from './Unit.d';

import { DIRECTION, ACTION } from '../shared/constants.js';
import { getHealthColorByPercentage } from '../utils/UnitUtils';
import Position from '../shared/Position';
import UnitImage from './Unit/UnitImage';
import EffectsFactory from './Unit/EffectsFactory';

const GAMEBOARD_HEIGHT = 8;
const GAMEBOARD_WIDTH = 8;
const ONE_CELL_HEIGHT = 64;
const SPRITE_SIZE = 32;
const MAX_MANA = 100;

export default class Unit extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const { unit } = props;
    const { x, y, id } = unit;
    const position = this.getPositionFromCoordinates(x, y);
    this.state = {
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      id,
      direction: unit.team ? DIRECTION.NORTH : DIRECTION.SOUTH,
      isMoving: false,

      stats: unit,
      effects: [],

      mana: 0,
      health: unit.health,

      unitSpriteDimensions: unit.spriteSize * SPRITE_SIZE,
      isLoaded: false,

      top: position.top,
      left: position.left,
      transition: '',

      isDead: false
    };
  }

  componentDidMount() {
    this.props.onLifecycle &&
      this.props.onLifecycle({
        type: 'SPAWN',
        component: this
      });
  }

  get id() {
    return this.state.id;
  }

  get startingPosition() {
    const { unit } = this.props;
    return new Position(unit.x, unit.y);
  }

  /**
   *
   * @param {Object} action Action happened
   * @param {Boolean} isTarget Is current unit being a target for this action?
   * @returns {Promise}
   */
  onAction(action) {
    return new Promise((resolve) => {
      const { payload, effects } = action;

      if (effects && effects.length) {
        effects.forEach((eff) => {
          const { top, left } = this.getPositionFromCoordinates(eff.from.x, eff.from.y, true);
          this.addEffect({
            type: 'effect',
            ...eff,
            from: { // rewriting from.x and from.y with from.top/left
              top,
              left
            },
          });
        });
      }

      switch (action.type) {
        case ACTION.MOVE: {
          if (payload.to) {
            this.move(payload, () => resolve(action));
          }
          break;
        }
        case ACTION.ATTACK: {
          this.attack(payload.to?.x, payload.to?.y, payload.duration, () => resolve(action));
          break;
        }
        case ACTION.HEALTH_CHANGE: {
          this.healthChange(payload.value, () => resolve(action));
          break;
        }
        case ACTION.MANA_CHANGE: {
          this.manaChange(payload.value);
          resolve(action);
          break;
        }
        case ACTION.SPAWN: {
          resolve(action);
          break;
        }
        case ACTION.DEATH: {
          this.death(() => resolve(action));
          break;
        }
        case ACTION.CAST: {
          this.spellCast(action.spellName, () => resolve(action));
          break;
        }
        case ACTION.EFFECT: {
          // already processed before switch statement
          break;
        }
        default: {
          console.warn('Unhandled action!', action);
          throw new Error('Unhandled action for Unit!');
        }
      }
    });
  }

  private spellCast(spellName, callback) {
    this.addEffect({
      type: 'text',
      text: spellName,
      classes: 'green'
    });

    callback();
  }

  private death(callback) {
    this.addEffect({
      type: 'effect',
      id: 'ghost',
      duration: 500,
      from: {
        top: 0,
        left: 0
      },
      callback: () =>
        this.setState(
          {
            isDead: true
          },
          () => callback()
        )
    });
  }

  private move(stepPayload, callback) {
    const { to, stepDuration } = stepPayload;
    const { top, left } = this.getPositionFromCoordinates(to.x, to.y);

    this.setState(
      {
        x: to.x,
        y: to.y,
        top,
        left,
        transition: `transform ${stepDuration}ms linear`,
        direction: this.getDirectionToTarget(to.x, to.y),
        isMoving: true
      },
      () => callback()
    );
  }

  /**
   * @param relative is position should be relative to unit position?
   */
  getPositionFromCoordinates(x, y, relative = false) {
    if (relative) {
      const { x: unitPosX, y: unitPosY } = this.state;
      if (x === unitPosX && y === unitPosY) {
        return { top: 0, left: 0 }
      }

      const currentPos = this.getPositionFromCoordinates(unitPosX, unitPosY);
      const requestedPos = this.getPositionFromCoordinates(x, y);
      return {
        top: requestedPos.top - currentPos.top,
        left: requestedPos.left - currentPos.left
      };
    }

    const unitDimsCorrection = (ONE_CELL_HEIGHT - (this.state?.unitSpriteDimensions || 32)) / 2;
    const isInHand = y === -1;
    const top = (isInHand ? 0 : Math.abs(y - GAMEBOARD_HEIGHT + 1)) * ONE_CELL_HEIGHT - unitDimsCorrection;
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

  onEffectDone(effectID) {
    const currentEffect = this.state.effects.filter((effect) => effect.id === effectID)[0];
    const effectCallback = currentEffect && currentEffect.callback;

    this.setState(
      {
        effects: [...this.state.effects].filter((effect) => effect.id !== effectID)
      },
      () => {
        if (effectCallback) {
          effectCallback();
        }
      }
    );
  }

  attack(x: number, y: number, duration: number, callback: Function) {
    const { top: targetTop, left: targetLeft } = this.getPositionFromCoordinates(x, y);
    const { top, left } = this.state;
    const midpointTop = (targetTop + top) / 2;
    const midpointLeft = (targetLeft + left) / 2;
    this.setState({
      direction: this.getDirectionToTarget(x, y),
      isMoving: false
    });

    if (this.isMelee()) {
      this.setState(
        {
          top: midpointTop,
          left: midpointLeft,
          transition: `transform ${duration}ms ease`
        },
        () => callback()
      );

      setTimeout(() => {
        // Recalculate position instead of passing {top, left} since there is a possibility unit should not return to the same position it started the attack from due to ongoing animations and whatnot
        this.setState({ ...this.getPositionFromCoordinates(this.state.x, this.state.y) });
      }, duration);
    } else {
      const { id: particleID } = this.props.unit.attack.particle; // has id and duration(?)

      if (!particleID) {
        console.warn('No particle for range attack', this.props.unit);
        throw new Error('No particle for range attack');
      }

      this.addEffect({
        type: 'particle',
        id: particleID,
        duration,
        from: {
          top: top,
          left: left
        },
        to: {
          top: midpointTop - top,
          left: midpointLeft - left
        }
      });

      callback(); // todo this callback should be actually linked to created particle (:
    }
  }

  addEffect(effect) {
    this.setState((prevState) => ({
      effects: [...prevState.effects, EffectsFactory.create(effect)]
    }));
  }

  manaChange(value) {
    let { mana } = this.state;
    this.setState({
      mana: Math.max(0, Math.min(mana + value, MAX_MANA))
    });
  }

  healthChange(value, callback) {
    let { health, stats } = this.state;
    this.setState(
      {
        health: Math.max(0, Math.min(health + value, stats.health))
      },
      () => {
        this.addEffect({
          type: 'text',
          text: value,
          classes: value > 0 ? 'green' : 'red'
        });

        callback();
      }
    );
  }

  componentWillUnmount() {
    this.props.onLifecycle &&
      this.props.onLifecycle({
        type: 'DESTROY',
        component: this
      });
  }

  isMelee() {
    return this.state.stats.attack.range === 1;
  }

  render() {
    const { top, left, transition, health, mana, direction, isMoving, stats, isLoaded, isDead, y, effects } = this.state;

    if (isDead) {
      return null;
    }

    const classes = classNames({
      unit: true,
      'm-loading': !isLoaded,
      'unit-onhand': y === -1,
      'm-in-battle': false // todo
    });

    const { unit } = this.props;

    return (
      <div
        className={classes}
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${left}px, ${top}px, 0)`,
          transition
        }}
      >
        {(<UnitImage lookType={unit.lookType} direction={direction} isMoving={isMoving} extraClass={''} />)}
        {effects.map((effect) => EffectsFactory.render(effect, this.onEffectDone.bind(this)))}
        <div className="unit-healthbar">
          <div
            className="unit-healthbar-fill"
            style={{
              backgroundColor: getHealthColorByPercentage((health / stats.health) * 100, stats.teamId),
              right: `${21 - 20 * (health / stats.health)}px`
            }}
          />
        </div>
        <div className="unit-manabar">
          <div
            className="unit-manabar-fill"
            style={{
              right: `${21.5 - 20 * (mana / MAX_MANA)}px`
            }}
          />
        </div>
      </div>
    );
  }
}
