///<reference path="complex.ts" />
///<reference path="viewState.ts" />
///<reference path="colorSchemes.ts" />
///<reference path="stopwatch.ts" />

interface Size {
    width: number;
    height: number;
}

function drawMandelbrot(canvasElementId: string, viewState: ViewState) {
    const context = createRenderingContext();
    const iterations = computeMandelbrot(viewState, context.canvas);
    renderMandelbrot(context, iterations);

    function createRenderingContext() {
        const canvas = document.getElementById(canvasElementId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Can't find canvas using selector: ${canvasElementId}`);
        }
    
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
    
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error("Can't get canvas context");
        }

        return context;
    }

    function computeMandelbrot(viewState: ViewState, canvasSize: Size) {
        const sw = new Stopwatch("computeMandelbrot");

        const { width, height } = canvasSize;
        const { position, scale } = viewState;
        const aspectRatio = height / width;

        const xMin = position.x - scale / 2;
        const xMax = position.x + scale / 2;
        const yMin = position.y - scale / 2 * aspectRatio;
        const yMax = position.y + scale / 2 * aspectRatio;
    
        const values = new Array(width * height);
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cx = lerp(xMin, xMax, x / width);
                const cy = lerp(yMin, yMax, y / height);
                const i = computePoint(cx, cy, viewState.maxIterations);
                values[x + y * width] = i;
            }
        }
    
        sw.stop();
        return values;
    }

    function computePoint(x: number, y: number, maxIterations: number) {
        const Zn = new Complex();

        for (let iter = 0; iter < maxIterations; iter++) {
            Zn.square().add(x, y);
            if (Zn.sqabs() >= 4) {
                return iter;
            }
        }
        
        return maxIterations;
    };

    function renderMandelbrot(context: CanvasRenderingContext2D, iterations: number[]) {
        const sw = new Stopwatch("renderMandelbrot");

        const { width, height } = context.canvas;
        const imageData = context.getImageData(0, 0, width, height);
        const colorInterpolator = colorSchemes[viewState.colorScheme];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const iterCount = iterations[x + y * width];
                const iterFactor = iterCount / viewState.maxIterations;
                const i = (x + y * width) * 4;
                const color = colorInterpolator(iterFactor);
                
                imageData.data[i] = color.r;
                imageData.data[i + 1] = color.g;
                imageData.data[i + 2] = color.b;
                imageData.data[i + 3] = 255;
            }
        }

        context.putImageData(imageData, 0, 0);

        sw.stop();
    }

    function lerp(a: number, b: number, x: number): number {
        return (
            x < 0 ? a
            : x > 1 ? b
            : a + x * (b - a)
        );
    }
}