import React, { Component } from 'react';
import Board from './GameBoard/Board.jsx';

import {Motion, spring} from 'react-motion';
import range from 'lodash.range';

const springSetting1 = {stiffness: 180, damping: 10};
const springSetting2 = {stiffness: 120, damping: 17};
function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A',
];
const [count, width, height] = [11, 70, 90];
// indexed by visual position
const layout = range(count).map(n => {
  const row = Math.floor(n / 3);
  const col = n % 3;
  return [width * col, height * row];
});
class GameBoard extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mouseXY: [0, 0],
      mouseCircleDelta: [0, 0], // difference between mouse and circle pos for x + y coords, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      order: range(count), // index: visual position. value: component key/id
    };
  }
  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  };

  handleTouchStart = (key, pressLocation, e) => {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  handleMouseMove = ({pageX, pageY}) => {
    const {order, lastPress, isPressed, mouseCircleDelta: [dx, dy]} = this.state;
    if (isPressed) {
      const mouseXY = [pageX - dx, pageY - dy];
      const col = clamp(Math.floor(mouseXY[0] / width), 0, 2);
      const row = clamp(Math.floor(mouseXY[1] / height), 0, Math.floor(count / 3));
      const index = row * 3 + col;
      const newOrder = reinsert(order, order.indexOf(lastPress), index);
      this.setState({mouseXY, order: newOrder});
    }
  };

  handleMouseDown = (key, [pressX, pressY], {pageX, pageY}) => {
    this.setState({
      lastPress: key,
      isPressed: true,
      mouseCircleDelta: [pageX - pressX, pageY - pressY],
      mouseXY: [pressX, pressY],
    });
  };

  handleMouseUp = () => {
    this.setState({isPressed: false, mouseCircleDelta: [0, 0]});
  };

  render () {
    const {order, lastPress, isPressed, mouseXY} = this.state;
   return <div className={(!this.props.onGoingBattle ? 'boardDiv' : 'boardDivBattle')}>
   <div>
     <Board height={8} width={8} map={this.props.myBoard} isBoard={true} newProps={this.props}/>
   </div>
   <div className='levelDiv'>
     <div className={`levelBar overlap ${(this.props.exp === 0 ? 'hidden' : '')}`} 
     style={{width: (this.props.expToReach !== 0 ? String(this.props.exp/this.props.expToReach * 100) : '100') + '%'}}/>
     <div className='biggerText centerWith50 overlap levelText'>
       <span className='text_shadow paddingLeft5 paddingRight5'>{'Level ' + JSON.stringify(this.props.level, null, 2)}</span>
       {<span className='text_shadow paddingLeft5 paddingRight5'>{'( ' + (this.props.expToReach === 'max' ? 'max' : this.props.exp + '/' + this.props.expToReach) + ' )'}</span>}
     </div>
     <div className='overlap text_shadow marginTop5 paddingLeft5 levelTextExp'>
       {'Exp: ' + this.props.exp + '/' + this.props.expToReach}
     </div>
   </div>
   <div className={`flex center ${(this.props.index === this.props.visiting ? 'handDiv' : 'handDivVisiting')}`}>
     <Board height={1} width={8} map={this.props.myHand} isBoard={false} newProps={this.props}/>
     <div className="demo2">
        {order.map((_, key) => {
          let style;
          let x;
          let y;
          const visualPosition = order.indexOf(key);
          if (key === lastPress && isPressed) {
            [x, y] = mouseXY;
            style = {
              translateX: x,
              translateY: y,
              scale: spring(1.2, springSetting1),
              boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1),
            };
          } else {
            [x, y] = layout[visualPosition];
            style = {
              translateX: spring(x, springSetting2),
              translateY: spring(y, springSetting2),
              scale: spring(1, springSetting1),
              boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1),
            };
          }
          return (
            <Motion key={key} style={style}>
              {({translateX, translateY, scale, boxShadow}) =>
                <div
                  onMouseDown={this.handleMouseDown.bind(null, key, [x, y])}
                  onTouchStart={this.handleTouchStart.bind(null, key, [x, y])}
                  className="demo2-ball"
                  style={{
                    backgroundColor: allColors[key],
                    WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    zIndex: key === lastPress ? 99 : visualPosition,
                    boxShadow: `${boxShadow}px 5px 5px rgba(0,0,0,0.5)`,
                  }}
                />
              }
            </Motion>
          );
        })}
      </div>
   </div>
 </div>;
  }
}

export default GameBoard;