import BaseEffect from './BaseEffect';

interface EffectConfig {
    lookType: string;
    speed: number;
    from: EffectPosition;
    to?: EffectPosition;
    callback?: Function;
}

export default class Effect extends BaseEffect {
    public to: EffectPosition | undefined;

    constructor (econfig: EffectConfig) {
        super(econfig);

        this.to = econfig.to;
    }
}
