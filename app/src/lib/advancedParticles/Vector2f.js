export class Vector2f {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        if (isNaN(v)) {
            this.x = this.x + v.x;
            this.y = this.y + v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    }

    sub(v) {
        if (isNaN(v)) {
            this.x = this.x - v.x;
            this.y = this.y - v.y;
        } else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }

    multiply(input) {
        this.x *= input;
        this.y *= input;
        return this;
    }

    length() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    normalize() {
        var l = this.length();
        console.log(this);
        console.log(l);
        console.log('mormalinze');
        this.x /= l;
        this.y /= l;
        console.log("TCL: Vector2f -> normalize -> this", this)

        return this;
    }

    clone() {
        return new Vector2f(this.x, this.y);
    }

    distToVector(v) {
        return Math.sqrt(this.distSquaredToVector(v));
    }

    distSquaredToVector(v) {
        return (this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y);
    }
}

function test() {
    var first = new Vector2f(400, 380);
    var second = new Vector2f(396, 380);
    var distance = first.distSquaredToVector(second);
    console.log("TCL: distance", distance)

    var math = Math.abs(-32 * -32) + Math.abs(-32 * -32);
    console.log("TCL: math", math)
}

test()