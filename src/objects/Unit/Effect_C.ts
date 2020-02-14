const uuidv1 = require('uuid/v1');

interface EffectPosition {
    top: number;
    left: number;
}

interface EffectConfig {
    lookType: string;
    speed: number;
    from: EffectPosition;
    to?: EffectPosition;
}

export default class Effect_C {
    public id: string;
    public lookType: string;
    public speed: number;
    public from: EffectPosition;
    public to: EffectPosition | undefined;
    public __proto__: any; 

    constructor (econfig: EffectConfig) {
        this.id = uuidv1();
        this.lookType = econfig.lookType;
        this.speed = econfig.speed;
        this.from = econfig.from;
        this.to = econfig.to;
    }
}