import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';

import ItemTypes from './ItemTypes';

import getPawnImageSrc from './Pawn/pawnImage.helper';
export default function Pawn({ cellPosition, name, direction, idle }) {
	const [{ isDragging }, drag, preview] = useDrag({
		item: {
			type: ItemTypes.PAWN,
			position: cellPosition
		},
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});

	let creature = {};
	try {
		const unitJson = JSON.parse(localStorage.getItem('unitJSON'));
		creature = unitJson[name];
	} catch (e) {}

	let lookType = creature.lookType || 25;

	return (
		<div
			ref={drag}
			className="pawn"
			style={{
				height: '64px',
				width: '64px',
				opacity: isDragging ? 0.5 : 1,
				fontSize: 25,
				cursor: 'move'
			}}
		>
			<DragPreviewImage connect={preview} src={getPawnImageSrc(lookType, 3, true)} />
		</div>
	);
}
