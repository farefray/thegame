import PawnImage from '../src/App/PawnImage.jsx';
import sprites from '../src/shared/monsters/dwarf.json';

export default {
  component: PawnImage,
  props: {
    position: '1,1',
    name: 'dwarf',
    back: true,
    sideLength: 80,
    classList: '',
    isBoard: true,
    newProps: {
      onGoingBattle: true,
      monsterSprites: {
        'dwarf': sprites
      }
    }
  }
};