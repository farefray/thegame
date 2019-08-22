import React from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Pawn from './Pawn';

export default <DndProvider backend={HTML5Backend}>
            <Pawn cellPosition={{
                x: 1,
                y: 1
            }} idle={false} name={"minotaur"} direction={1} flippedProps={{}} />
    </DndProvider>;
