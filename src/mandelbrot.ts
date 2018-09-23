///<reference path="complex.ts" />
///<reference path="parameters.ts" />
///<reference path="colorSchemes.ts" />

const lerp = (a: number, b: number, x: number): number =>
    x < 0 ? a
    : x > 1 ? b
    : a + (x * (b - a));

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

    function computeMandelbrot(parameters: Parameters, screenW: number, screenH: number) {
        console.time("CalculateMandelbrot");

        const aspectRatio = screenH / screenW;
        const cxmin = parameters.position.x - parameters.scale / 2;
        const cxmax = parameters.position.x + parameters.scale / 2;
        const cymin = parameters.position.y - parameters.scale / 2 * aspectRatio;
        const cymax = parameters.position.y + parameters.scale / 2 * aspectRatio;
    
        const values = new Array(screenW * screenH);
    
        for (let y = 0; y < screenH; y++) {
            for (let x = 0; x < screenW; x++) {
                const cx = lerp(cxmin, cxmax, x / screenW);
                const cy = lerp(cymin, cymax, y / screenH);
                const i = iterate(cx, cy, parameters.maxIterations);
                values[x + y * screenW] = i;
            }
        }
    
        console.timeEnd("CalculateMandelbrot");

        return values;
    }

    function renderMandelbrot(context: CanvasRenderingContext2D, values: number[]) {
        console.time("RenderMandelbrot");

        const screenW = context.canvas.width;
        const screenH = context.canvas.height;
        const imageData = context.getImageData(0, 0, screenW, screenH);
        const colorScheme = colorSchemes[parameters.colorScheme];

        for (let y = 0; y < screenH; y++) {
            for (let x = 0; x < screenW; x++) {
                const value = values[x + y * screenW];
                const f = value / parameters.maxIterations;
                const c = Math.floor(lerp(0, 255, f));
                const i = (x + y * screenW) * 4;
                
                const color = colorScheme(f);
                imageData.data[i] = color.r;
                imageData.data[i + 1] = color.g;
                imageData.data[i + 2] = color.b;
                imageData.data[i + 3] = 255;
            }
        }

        context.putImageData(imageData, 0, 0);

        console.timeEnd("RenderMandelbrot");
    }

    const values = computeMandelbrot(parameters, canvas.width, canvas.height);
    renderMandelbrot(context, values);
}