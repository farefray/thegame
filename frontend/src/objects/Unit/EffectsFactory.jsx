import Effect from './EffectsWrapper/Effect';
import Text from './EffectsWrapper/Text';
import Particle from './EffectsWrapper/Particle';

const EffectsFactory = {
  create: function (type, effectParams) {
    switch (type) {
      case 'particle': {
        return new Particle({...effectParams});
      }
  
      case 'text': {
        return new Text({...effectParams});
      }

      case 'effect':
      default: {
        return new Effect({...effectParams})
      }
    }
  }
}

export default EffectsFactory;

