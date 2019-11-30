import React from 'react';
import _ from 'lodash';
import Effect from './Effect';
import Effect_C from './Effect_C';

interface IProps {
  effects: Array<Effect_C>;
  onEffectDone: Function;
}

interface IState {
  effects: Array<Effect_C>
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

    console.log(_.cloneDeep(effects));

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
      return <Effect key={effect.id} instance={effect} onDone={this.props.onEffectDone}/>;
    });
  }
}

export default EffectsWrapper;