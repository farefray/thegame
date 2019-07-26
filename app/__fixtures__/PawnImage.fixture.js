import PawnImage from '../src/App/PawnImage.jsx';

export default {
  component: PawnImage,
  props: {
    position: '1,1',
    name: 'dwarf',
    direction: 1,
    idle: true,
    classList: '',
    isBoard: true,
    newProps: {
      onGoingBattle: true
    }
  }
};