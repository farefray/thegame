import PawnImage from '../src/App/PawnImage.jsx';

export default {
  component: PawnImage,
  props: {
    position: '1,1',
    name: 'dwarf',
    direction: 1,
    idle: false,
    classList: '',
    isBoard: true,
    newProps: {
      onGoingBattle: true,
      unitJson: {
        "dwarf": {
          "name": "dwarf",
          "displayName": "Dwarf",
          "looktype": 69,
          "cost": 1,
          "hp": 650,
          "attack": 10,
          "defense": 155,
          "speed": 80,
          "type": "normal",
          "ability": "splash",
          "evolves_to": null,
          "specialAttack": 0,
          "specialDefense": 0
        }
      }
    }
  }
};