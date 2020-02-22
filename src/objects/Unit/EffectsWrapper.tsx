import React from 'react';
import _ from 'lodash';
import Effect from './EffectsWrapper/Effect.tsx';
import Text from './EffectsWrapper/Text.tsx';
import Particle from './EffectsWrapper/Particle.tsx';

interface IProps {
  effects: Array<BaseEffect>;
  onEffectDone: Function;
}

interface IState {
  effects: Array<BaseEffect>
}

class EffectsWrapper extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      effects: props.effects
    }
  }

  static getDerivedStateFromProps(props, current_state) {
    if (_.isEqual(current_state.effects, props.effects)) {
      return null;
    }

    // first filter out effects from state which are already expired
    const effects = current_state.effects.filter(effect => {
      const effectIsStilActive = props.effects.find((e => e.id === effect.id));
      return effectIsStilActive;
    })

    props.effects.forEach(effect => {
      // no effect wit this id was rendered yet, so lets add to state
      if (!effects.find((e => e.id === effect.id))) {
        effects.push(effect);
      }
    });

    return {
      effects
    }
  }

  render() {
    return this.state.effects.map(effect => {
      let component = null;
      switch (effect.__proto__.constructor.name) {
        case 'Effect': {
          component = <Effect key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
          break;
        }

        case 'Particle': {
          component = <Particle key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
          break;
        }

        case 'Text': {
          component = <Text key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
          break
        }
      }

      return component;
    });
  }
}

export default EffectsWrapper;
