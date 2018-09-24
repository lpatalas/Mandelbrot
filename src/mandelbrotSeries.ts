class MandelbrotSeries {
    private a: number = 0;
    private b: number = 0;
    private aSquared: number = 0;
    private bSquared: number = 0;

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