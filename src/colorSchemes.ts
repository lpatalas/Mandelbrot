
interface Rgb {
    r: number;
    g: number;
    b: number;
}

const colorSchemes: Array<(value: number) => Rgb> = [
    function (value: number) {
        const c = Math.floor(value * 255);
        return {
            r: c,
            g: c,
            b: c
        };
    },
    function (value: number) {
        return {
            r: Math.floor(value * 255),
            g: Math.floor(value * 255),
            b: 128 + Math.floor(value * 128)
        };
    },
    function (value: number) {
        return {
            r: Math.floor(value * 255),
            g: Math.floor(value * 255),
            b: 64 + Math.floor(value * 192)
        };
    },
    function (value: number) {
        return {
            r: Math.floor(Math.pow(value, 0.5) * 255),
            g: Math.floor(Math.pow(value, 2) * 255),
            b: 128 + Math.floor(value * 128)
        };
    },
    function (value: number) {
        if (value <= 0.5) {
            return {
                r: Math.floor(value * 2 * 255),
                g: Math.floor(value * 2 * 255),
                b: 0
            };
        }
        else {
            return {
                r: 255,
                g: 255,
                b: Math.floor((value - 0.5) * 2 * 255)
            };
        }
    },
    function (value: number) {
        if (value <= 0.25) {
            return {
                r: Math.floor(value * 4 * 255),
                g: 0,
                b: 0
            };
        }
        else if (value <= 0.75) {
            return {
                r: 255,
                g: Math.floor((value - 0.25) * 2 * 255),
                b: 0
            };
        }
        else {
            return {
                r: 255,
                g: 255,
                b: Math.floor((value - 0.75) * 4 * 255)
            };
        }
    },
    function (value: number) {
        if (value <= 0.25) {
            return {
                r: 0,
                g: 0,
                b: 64 + Math.floor(value * 4 * 192)
            };
        }
        else if (value <= 0.5) {
            const x = (value - 0.25) * 4;
            return {
                r: Math.floor(x * 192),
                g: Math.floor(x * 192),
                b: 255 - Math.floor(x * 255)
            };
        }
        else {
            const x = (value - 0.5) * 2;
            return {
                r: 192 - Math.floor(x * 192),
                g: 192,
                b: 0
            };
        }
    },
]
