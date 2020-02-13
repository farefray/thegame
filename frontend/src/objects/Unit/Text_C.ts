const uuidv1 = require('uuid/v1');

// interface EffectPosition {
//     top: number;
//     left: number;
// }

interface EffectConfig {
    text: string;
    // pos: EffectPosition;
    speed?: number;
}

export default class Effect_C {
    public id: string;
    public text: string;
    // public pos: EffectPosition;
    public speed?: number;

    constructor (config: EffectConfig) {
        this.id = uuidv1();
        this.text = config.text;
        // this.pos = config.pos;

        this.speed = config.speed || 750;
    }
}