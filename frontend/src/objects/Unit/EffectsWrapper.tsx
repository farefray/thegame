import React from 'react';
import _ from 'lodash';
import { EffectComponent } from './EffectsWrapper/Effect';
import { TextComponent } from './EffectsWrapper/Text';
import { ParticleComponent } from './EffectsWrapper/Particle';
import { BaseEffect } from './EffectsWrapper/BaseEffect';

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
      let component;
      switch (effect.__proto__.constructor.name) {
        case 'Effect': {
          component = <EffectComponent key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
          break;
        }

        case 'Particle': {
          component = <ParticleComponent key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
          break;
        }

        case 'Text': {
          component = <TextComponent key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
          break
        }
      }

      return component;
    });
  }
}

export default EffectsWrapper;