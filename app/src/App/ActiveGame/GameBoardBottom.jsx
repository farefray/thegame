import React, { Component } from 'react';
import { placePieceEvent } from '../../events'
import Cell from './GameBoard/Cell.jsx';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

class GameBoardBottom extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <div className='levelDiv'>
            <div className={`levelBar overlap ${(this.props.exp === 0 ? 'hidden' : '')}`}
                style={{ width: (this.props.expToReach !== 0 ? String(this.props.exp / this.props.expToReach * 100) : '100') + '%' }} />
            <div className='biggerText centerWith50 overlap levelText'>
                <span className='text_shadow paddingLeft5 paddingRight5'>{'Level ' + JSON.stringify(this.props.level, null, 2)}</span>
                {<span className='text_shadow paddingLeft5 paddingRight5'>{'( ' + (this.props.expToReach === 'max' ? 'max' : this.props.exp + '/' + this.props.expToReach) + ' )'}</span>}
            </div>
            <div className='overlap text_shadow marginTop5 paddingLeft5 levelTextExp'>
                {'Exp: ' + this.props.exp + '/' + this.props.expToReach}
            </div>
        </div>
    }
};

export default GameBoardBottom;