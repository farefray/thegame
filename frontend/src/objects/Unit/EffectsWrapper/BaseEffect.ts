const hyperid = require('hyperid');

export interface EffectPosition {
    top: number;
    left: number;
}

interface BaseEffectConfig {
    duration: string;
    effect: number;
    from: EffectPosition;
    id: string;
    callback?: Function;
}

export interface BaseEffectType extends BaseEffectConfig {
    id: string;
    __proto__: any;
    callback?: Function;
}

export class BaseEffect implements BaseEffectType {
    public id: string;
    public __proto__: any;
    public duration: string;
    public effect: number;
    public from: EffectPosition;
    public lookType: string;
    public callback?: Function;

    constructor (conf: BaseEffectConfig) {
        this.id = hyperid().uuid;

        const { duration, effect, from, id } = conf;
        this.duration = duration;
        this.effect = effect;
        this.from = from;
        this.lookType = id;

        if (conf.callback) {
            this.callback = conf.callback;
        }
    }
}