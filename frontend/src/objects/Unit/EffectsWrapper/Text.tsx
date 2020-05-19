import { BaseEffect, BaseEffectType } from './BaseEffect';

type TextType = BaseEffectType & {
    text: string;
    speed?: number;
    classes?: string;
}

export class Text extends BaseEffect implements TextType {
    public text: string;
    public speed?: number;
    public classes?: string;

    constructor (econfig: TextType) {
        super(econfig);

        this.text = econfig.text;
        this.speed = econfig.speed || 750;
        this.classes = econfig.classes;
    }
}


