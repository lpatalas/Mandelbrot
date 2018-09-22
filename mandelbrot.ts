
type Complex = { a: number; b: number };

type Parameters = {
    bounds: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    };
    maxIterations: number;
}

function drawMandelbrot(containerElementId: string, parameters: Parameters) {
    const container = document.querySelector(containerElementId);
    if (!container) {
        throw new Error(`Can't find container element '${containerElementId}'`);
    }

    const canvasSelector = `${containerElementId} > canvas`;
    const canvasElement = document.querySelector(canvasSelector);
    if (!canvasElement) {
        throw new Error(`Can't find canvas using selector: ${canvasSelector}`);
    }

    const canvas = canvasElement as HTMLCanvasElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        console.error("Can't get canvas context");
        return;
    }

    const screenW = canvas.width;
    const screenH = canvas.height;

    const setPixel = (x: number, y: number, color: string) => {
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
    };

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

    const iterate = (x: number, y: number, maxIterations: number) => {
        let Zn = { a: 0, b: 0 };

        for (let iter = 0; iter < maxIterations; iter++) {
            Zn = cadd(csquare(Zn), { a: x, b: y });
            if (cabs(Zn) >= 2) {
                return iter;
            }
        }
        
        return maxIterations;
    };

    const lerp = (a: number, b: number, x: number): number =>
        x < 0 ? a
        : x > 1 ? b
        : a + (x * (b - a));

    const cxmin = parameters.bounds.xMin;
    const cxmax = parameters.bounds.xMax;
    const cymin = parameters.bounds.yMin;
    const cymax = parameters.bounds.yMax;

    for (let x = 0; x < screenW; x++) {
        for (let y = 0; y < screenH; y++) {
            const cx = lerp(cxmin, cxmax, x / screenW);
            const cy = lerp(cymin, cymax, y / screenH);
            const i = iterate(cx, cy, parameters.maxIterations);
            const c = lerp(0, 255, i / parameters.maxIterations);
            setPixel(x, y, `rgb(${c}, ${c}, ${c})`);
        }
    }
}