import React from 'react';
import { Effect } from './EffectsWrapper/Effect';
import { Text } from './EffectsWrapper/Text';
import { Particle } from './EffectsWrapper/Particle';
import EffectComponent from './EffectsWrapper/EffectComponent';
import ParticleComponent from './EffectsWrapper/ParticleComponent';
import TextComponent from './EffectsWrapper/TextComponent';

/**
 * ? Consider using pixijs - https://github.com/pixijs/pixi.js sprites over div for particles
 */
const EffectsFactory = {
  create: (config) => {
    switch (config.type) {
      case 'effect': {
        return new Effect(config);
      }

      case 'particle': {
        return new Particle(config);
      }

      case 'text':
      default: {
        return new Text(config);
      }
    }
  },
  render: (effect, onEffectDone) => {
    switch (effect.type) {
      case 'effect': {
        return <EffectComponent key={effect.id} instance={effect} onDone={onEffectDone} />;
      }

      case 'particle': {
        return <ParticleComponent key={effect.id} instance={effect} onDone={onEffectDone} />;
      }

      case 'text':
      default: {
        return <TextComponent key={effect.id} instance={effect} onDone={onEffectDone} />;
      }
    }
  }
};

export default EffectsFactory;
