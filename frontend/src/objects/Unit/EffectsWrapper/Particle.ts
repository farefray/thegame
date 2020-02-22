import BaseEffect from './BaseEffect';

interface EffectConfig {
    lookType: string;
    from: EffectPosition;
    to?: EffectPosition;
    callback?: Function;
}

export default class Particle extends BaseEffect {
    public to: EffectPosition | undefined;

    constructor (econfig: EffectConfig) {
        super(econfig);

        this.to = econfig.to;
        this.lookType = econfig.lookType;
    }
}
