interface Point {
    x: number;
    y: number;
}

class Bounds {
    get height() { return Math.abs(this.end.y - this.start.y); }
    get width() { return Math.abs(this.end.x - this.start.x); }

    get center() {
        const topLeft = this.topLeft;
        const bottomRight = this.bottomRight;
        return {
            x: (bottomRight.x + topLeft.x) / 2,
            y: (bottomRight.y + topLeft.y) / 2
        }
    }

    get topLeft() {
        return {
            x: Math.min(this.start.x, this.end.x),
            y: Math.min(this.start.y, this.end.y),
        };
    }

    get bottomRight() {
        return {
            x: Math.max(this.start.x, this.end.x),
            y: Math.max(this.start.y, this.end.y),
        };
    }

    static get empty() {
        return new Bounds({ x: 0, y: 0 }, { x: 0, y: 0 });
    }

    constructor(
        readonly start: Point,
        readonly end: Point
    ) {
    }

    asNormalized() {
        return new Bounds(this.topLeft, this.bottomRight);
    }

    copy() {
        return new Bounds(this.start, this.end);
    }

    moveBy(offset: Point): Bounds {
        return new Bounds(
            { x: this.start.x + offset.x, y: this.start.y + offset.y },
            { x: this.end.x + offset.x, y: this.end.y + offset.y }
        )
    }

    withEnd(end: Point): Bounds {
        return new Bounds(this.start, end);
    }
}
