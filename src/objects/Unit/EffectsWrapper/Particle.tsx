import { BaseEffect, BaseEffectType, EffectPosition } from './BaseEffect';

type ParticleType = BaseEffectType & {
    to: EffectPosition;
    lookType: string;
}

export class Particle extends BaseEffect implements ParticleType {
    public to: EffectPosition;
    public lookType: string;

    constructor (econfig: ParticleType) {
        super(econfig);

        this.to = econfig.to;
        this.lookType = econfig.id;
    }
}


