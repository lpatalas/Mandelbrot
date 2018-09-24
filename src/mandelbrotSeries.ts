class MandelbrotSeries {
    private a: number = Number.EPSILON;
    private b: number = Number.EPSILON;
    private aSquared: number = Number.EPSILON;
    private bSquared: number = Number.EPSILON;

    next(a: number, b: number) {
        const a2 = this.aSquared - this.bSquared;
        const b2 = 2 * this.a * this.b;

        this.a = a2 + a;
        this.b = b2 + b;
        this.aSquared = this.a * this.a;
        this.bSquared = this.b * this.b;
    }

    sqabs(): number {
        return this.aSquared * this.bSquared;
    }
}
