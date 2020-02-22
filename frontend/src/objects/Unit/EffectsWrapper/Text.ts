import BaseEffect from './BaseEffect';

interface EffectConfig {
    text: string;
    speed?: number;
    classes?: string;
}

export default class Text extends BaseEffect {
    public text: string;
    public speed?: number;
    public classes?: string;

    constructor (econfig: EffectConfig) {
        super(econfig);

        this.text = econfig.text;
        this.speed = econfig.speed || 750;
        this.classes = econfig.classes;
    }
}