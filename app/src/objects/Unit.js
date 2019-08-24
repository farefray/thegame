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
		console.log(unit);
		const [x, y] = unit.position.split(',');
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

	onAction(action) {
		switch (action.action) {
			case ACTION_MOVE:
				action.to && this.move(action.to.x, action.to.y);
				break;
			case ACTION_ATTACK:
				action.to && this.attack(action.to.x, action.to.y);
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

	getUnitAtCoordinates(x, y) {
		return this.props.allUnits.find(unit => unit.state.x === x && unit.state.y === y);
	}

	move(x, y) {
		const { top, left } = this.getPositionFromCoordinates(x, y);
		this.setState({
			x,
			y,
			top,
			left,
			transition: 'transform 1s linear',
			direction: this.getDirectionToTarget(x, y),
			isMoving: true
		});
	}

	attack(x, y) {
		const target = this.getUnitAtCoordinates(x, y);

		const { top: targetTop, left: targetLeft } = this.getPositionFromCoordinates(x, y);
		const { top, left } = this.state;
		const midpointTop = (targetTop + top) / 2;
		const midpointLeft = (targetLeft + left) / 2;
		this.setState({
			direction: this.getDirectionToTarget(x, y),
			isMoving: false
		});
		setTimeout(() => {
			target.takeDamage(7.5);
			this.setState({
				top: midpointTop,
				left: midpointLeft,
				transition: 'transform 0.1s ease'
			});
			setTimeout(() => {
				this.setState({ top, left });
			}, 100);
		}, Math.random() * 700);
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
