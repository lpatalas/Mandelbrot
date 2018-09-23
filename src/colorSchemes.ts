
interface Rgb {
    r: number;
    g: number;
    b: number;
}

const colorSchemes: Array<(value: number) => Rgb> = [
    function(value: number) {
        const c = Math.floor(value * 255);
        return {
            r: c,
            g: c,
            b: c
        };
    },
    function(value: number) {
        return {
            r: Math.floor(value * 255),
            g: Math.floor(value * 255),
            b: 128 + Math.floor(value * 128)
        };
    },
    function(value: number) {
        return {
            r: Math.floor(value * 255),
            g: Math.floor(value * 255),
            b: 64 + Math.floor(value * 192)
        };
    },
    function(value: number) {
        return {
            r: Math.floor(Math.pow(value, 0.5) * 255),
            g: Math.floor(Math.pow(value, 2) * 255),
            b: 128 + Math.floor(value * 128)
        };
    },
    function(value: number) {
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
    function(value: number) {
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
    }
]