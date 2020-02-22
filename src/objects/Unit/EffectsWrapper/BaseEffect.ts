const hyperid = require('hyperid');

interface EffectPosition {
    top: number;
    left: number;
}

interface BaseEffectConfig {
    duration: string;
    effect: number;
    from: EffectPosition;
    callback?: Function;
}

export default class BaseEffect {
    public id: string;
    public duration: number;
    public from: EffectPosition;
    public __proto__: any;
    public callback: Function;

    constructor (econfig: BaseEffectConfig) {
        this.id = hyperid().uuid;
        Object.assign(this, econfig);
    }
}