import {
    Vector2f
} from "./Vector2f.js";
import {
    BasicShader
} from "./BasicShader.js";
import {
    Matrix3
} from "./Matrix3.js";
import {
    ParticleBuffer
} from "./ParticleBuffer.js";
import {
    setupBaseParticleEmitter
} from "./BaseParticleEmitter";
import {
    FlameThrower
} from "./Custom/FlameThrower";

window.test = (x, y) => {
    new FlameThrower(new Vector2f(32, 32), new Vector2f(x, y));
}

var renderer;
export function initWebgl(canvas, spriteSheet) {
    console.log("init webgl;");
    renderer = new webGlRenderer(canvas, spriteSheet);
    setupBaseParticleEmitter(renderer);
}

export class webGlRenderer {
    constructor(canvas, spriteSheet) {
        this.particleEmitterList = new Array();
        this.canvas = canvas;
        this.spriteSheet = spriteSheet;
        this.gl = this.canvas.getContext("webgl" || "experimental-webgl");

        this.calculateWorldmatrix();

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        var bShader = new BasicShader(this.gl);
        this.compiledShaders = bShader.getCompiledShaders();
        this.render();
        this.loopCounter = 0;
    }

    calculateWorldmatrix() {
        var wantedResolution = 512;
        var width = this.canvas.width;
        var height = this.canvas.height;

        this.worldSpaceMatrix = new Matrix3().transition(new Vector2f(-1, 1)).scale(2 / wantedResolution, -2 / wantedResolution);
        this.gl.viewport(0, 0, width, height);
    }


    deleteEmitter(index) {
        this.particleEmitterList.splice(index, 1);
    }


    render() {
        this.loopCounter += 1;
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        let delta = 1;
        for (var i = this.particleEmitterList.length - 1; i >= 0; i--) {
            let emitter = this.particleEmitterList[i];
            emitter.update(delta);
            if (emitter.isDead && emitter.particleList.length == 0) {
                this.deleteEmitter();
            }
        }

        requestAnimationFrame(() => this.render());
    }
}