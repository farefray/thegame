import React from 'react';
import getPawnImageSrc from '../App/ActiveGame/GameBoard/Pawn/pawnImage.helper';
import { DIRECTION } from '../shared/constants';
import { getHealthColorByPercentage } from '../shared/UnitUtils';
const ACTION_MOVE = 1; // todo share with backend
const ACTION_ATTACK = 2;

export default class Unit extends React.Component {
  constructor(props) {
    super(props);
    props.addToUnitArray(this);

    const { unit } = props;
    const [x, y = 0] = unit.position.split(',');
    const { top, left } = this.getPositionFromCoordinates(parseInt(x, 10), parseInt(y, 10));

    this.state = {
      top,
      left,
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      direction: unit.team ? DIRECTION.NORTH : DIRECTION.SOUTH,
      isMoving: false,
      maxHealth: unit.hp,
      health: unit.hp
    };
  }

  componentWillUnmount() {
    this.props.removeFromUnitArray(this);
  }

  /**
   *
   * @param {Object} action Action happened
   * @param {Boolean} isTarget Is current unit being a target for this action?
   */
  onAction(action, isTarget) {
    switch (action.action) {
      case ACTION_MOVE:
        action.to && this.move(action.to.x, action.to.y);
        break;
      case ACTION_ATTACK:
        isTarget
          ? (() => {
              // displaying hp remove after a delay, for attack to finish. But this has to be done better way, I'll redo
              setTimeout(() => {
                this.takeDamage(action.damage);
              }, 500);
            })()
          : action.to && this.attack(action.to.x, action.to.y, action.damage);
        break;
      default:
        break;
    }
  }

  getPositionFromCoordinates(x, y) {
    const { getBoardBoundingClientRect, gameBoardWidth, gameBoardHeight } = this.props;
    return {
      top: ((gameBoardHeight - y - 1) * getBoardBoundingClientRect().height) / gameBoardHeight,
      left: (x * getBoardBoundingClientRect().width) / gameBoardWidth
    };
  }

  getSprite() {
    const { direction, isMoving } = this.state;
    const { unit } = this.props;
    const lookType = unit.lookType || 25;
    return getPawnImageSrc(lookType, direction, !isMoving);
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

  move(x, y) {
    const { top, left } = this.getPositionFromCoordinates(x, y);
    this.setState({
      x,
      y,
      top,
      left,
      transition: 'transform 0.6s linear',
      direction: this.getDirectionToTarget(x, y),
      isMoving: true
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
      this.setState({
        top: midpointTop,
        left: midpointLeft,
        transition: 'transform 0.1s ease'
      });
      setTimeout(() => {
        this.setState({ top, left });
      }, 100);
    }, 500); // todo better than constant delay
  }

  takeDamage(damage) {
    const health = Math.max(0, this.state.health - damage);
    this.setState({
      health,
      isDead: health === 0
    });
  }

  render() {
    const { top, left, transition, health, maxHealth, isDead } = this.state;
    if (isDead) return null;
    return (
      <div
        style={{
          pointerEvents: 'none',
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
        <img src={this.getSprite()} alt="Pawn" style={{ position: 'absolute', bottom: 0, right: 0 }} />
        <div
          className="healthbar"
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
      </div>
    );
  }
}
