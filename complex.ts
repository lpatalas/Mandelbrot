interface Complex {
    a: number;
    b: number;
}

const cadd = (c1: Complex, c2: Complex): Complex => {
    return {
        a: c1.a + c2.a,
        b: c1.b + c2.b
    };
};

const csquare = (c: Complex): Complex => {
    return {
        a: c.a * c.a - c.b * c.b,
        b: 2 * c.a * c.b
    };
};

const cabs = (c: Complex): number => {
    return Math.sqrt(c.a * c.a + c.b * c.b);
}