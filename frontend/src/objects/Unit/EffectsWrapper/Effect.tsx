import { BaseEffect, BaseEffectType } from './BaseEffect';

type EffectType = BaseEffectType & {
    lookType: string;
}

export class Effect extends BaseEffect implements EffectType {
    public lookType: string;

    constructor (econfig: EffectType) {
        super(econfig);

        this.lookType = econfig.id;
    }
}
