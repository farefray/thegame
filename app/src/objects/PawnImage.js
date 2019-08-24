import React from 'react';
import getPawnImageSrc from '../App/ActiveGame/GameBoard/Pawn/pawnImage.helper';
import { DIRECTION } from '../shared/constants';
const ACTION_MOVE = 1; // todo share with backend
const ACTION_ATTACK = 2;

export default class PawnImage extends React.Component {
	constructor(props) {
		super(props);

		const [x, y] = props.creatureData.position.split(',');
		const { top, left } = this.getPositionFromCoordinates(parseInt(x, 10), parseInt(y, 10));

		this.state = {
			top,
			left,
			x: parseInt(x, 10),
			y: parseInt(y, 10),
			direction: props.creatureData.team ? DIRECTION.NORTH : DIRECTION.SOUTH,
			isMoving: false
		};
	}

	componentDidMount() {
		this.props.subscribeToActions(this);
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
		const { creatureData } = this.props;
		const lookType = creatureData.lookType || 25;
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
			transition: 'transform 1s linear',
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
		}, Math.random() * 700);
	}

	render() {
		const { top, left, transition } = this.state;
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
			</div>
		);
	}
}
