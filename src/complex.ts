class Complex {
    a: number = 0;
    b: number = 0;

    add(a: number, b: number): this {
        this.a += a;
        this.b += b;
        return this;
    }

    sqabs(): number {
        return this.a * this.a + this.b * this.b;
    }

    square(): this {
        const a2 = this.a * this.a - this.b * this.b;
        const b2 = 2 * this.a * this.b;
    
        this.a = a2;
        this.b = b2;

        return this;
    }
}