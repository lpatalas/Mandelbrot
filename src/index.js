"use strict";
class Bounds {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    get height() { return Math.abs(this.end.y - this.start.y); }
    get width() { return Math.abs(this.end.x - this.start.x); }
    get center() {
        const topLeft = this.topLeft;
        const bottomRight = this.bottomRight;
        return {
            x: (bottomRight.x + topLeft.x) / 2,
            y: (bottomRight.y + topLeft.y) / 2
        };
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
    asNormalized() {
        return new Bounds(this.topLeft, this.bottomRight);
    }
    copy() {
        return new Bounds(this.start, this.end);
    }
    moveBy(offset) {
        return new Bounds({ x: this.start.x + offset.x, y: this.start.y + offset.y }, { x: this.end.x + offset.x, y: this.end.y + offset.y });
    }
    withEnd(end) {
        return new Bounds(this.start, end);
    }
}
const colorSchemes = [
    function (value) {
        const c = Math.floor(value * 255);
        return {
            r: c,
            g: c,
            b: c
        };
    },
    function (value) {
        return {
            r: Math.floor(value * 255),
            g: Math.floor(value * 255),
            b: 128 + Math.floor(value * 128)
        };
    },
    function (value) {
        return {
            r: Math.floor(value * 255),
            g: Math.floor(value * 255),
            b: 64 + Math.floor(value * 192)
        };
    },
    function (value) {
        return {
            r: Math.floor(Math.pow(value, 0.5) * 255),
            g: Math.floor(Math.pow(value, 2) * 255),
            b: 128 + Math.floor(value * 128)
        };
    },
    function (value) {
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
    function (value) {
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
    function (value) {
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
];
function findElementById(id, elementType) {
    const element = document.getElementById(id);
    if (!element || !(element instanceof elementType)) {
        throw new Error(`Can't find element: ${id}`);
    }
    return element;
}
function findElementBySelector(selector, elementType) {
    const element = document.querySelector(selector);
    if (!element || !(element instanceof elementType)) {
        throw new Error(`Can't find element: ${selector}`);
    }
    return element;
}
function px(x) {
    return `${x}px`;
}
class MandelbrotSeries {
    constructor() {
        this.a = Number.EPSILON;
        this.b = Number.EPSILON;
        this.aSquared = Number.EPSILON;
        this.bSquared = Number.EPSILON;
    }
    next(a, b) {
        const a2 = this.aSquared - this.bSquared;
        const b2 = 2 * this.a * this.b;
        this.a = a2 + a;
        this.b = b2 + b;
        this.aSquared = this.a * this.a;
        this.bSquared = this.b * this.b;
    }
    sqabs() {
        return this.aSquared * this.bSquared;
    }
}
///<reference path="colorSchemes.ts" />
class ViewState {
    constructor(colorScheme, maxIterations, position, scale) {
        this.colorScheme = colorScheme;
        this.maxIterations = maxIterations;
        this.position = position;
        this.scale = scale;
    }
    static getCurrent() {
        const urlParams = new URLSearchParams(location.search.substr(1));
        return new ViewState(safeParseInt(urlParams.get('colorScheme'), 0) % colorSchemes.length, safeParseInt(urlParams.get('maxIter'), 50), {
            x: safeParseFloat(urlParams.get('x'), -0.5),
            y: safeParseFloat(urlParams.get('y'), 0)
        }, safeParseFloat(urlParams.get('scale'), 4));
    }
    canvasToWorld(canvasPos, canvasSize) {
        const aspectRatio = canvasSize.height / canvasSize.width;
        const x = (canvasPos.x / canvasSize.width - 0.5) * this.scale;
        const y = (canvasPos.y / canvasSize.height - 0.5) * this.scale * aspectRatio;
        return {
            x: x + this.position.x,
            y: y + this.position.y
        };
    }
    toURLSearchParams() {
        return new URLSearchParams({
            x: this.position.x.toString(),
            y: this.position.y.toString(),
            scale: this.scale.toString(),
            maxIter: this.maxIterations.toString(),
            colorScheme: this.colorScheme.toString()
        });
    }
    withPosAndScale(position, scale) {
        return new ViewState(this.colorScheme, this.maxIterations, position, scale);
    }
}
function safeParseInt(value, defaultValue) {
    return value ? parseInt(value, 10) : defaultValue;
}
function safeParseFloat(value, defaultValue) {
    return value ? parseFloat(value) : defaultValue;
}
class Stopwatch {
    constructor(label) {
        this.label = label;
        console.time(label);
    }
    stop() {
        console.timeEnd(this.label);
    }
}
///<reference path="mandelbrotSeries.ts" />
///<reference path="viewState.ts" />
///<reference path="colorSchemes.ts" />
///<reference path="stopwatch.ts" />
function drawMandelbrot(canvasElementId, viewState) {
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
    function computeMandelbrot(viewState, canvasSize) {
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
    function computePoint(x, y, maxIterations) {
        const Zn = new MandelbrotSeries();
        for (let iter = 0; iter < maxIterations; iter++) {
            Zn.next(x, y);
            if (Zn.sqabs() >= 4) {
                return iter;
            }
        }
        return maxIterations;
    }
    ;
    function renderMandelbrot(context, iterations) {
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
    function lerp(a, b, x) {
        return (x < 0 ? a
            : x > 1 ? b
                : a + x * (b - a));
    }
}
///<reference path="viewState.ts" />
///<reference path="bounds.ts" />
///<reference path="domHelpers.ts" />
function initializeZoom(viewState, canvasElementId, selectionElementId) {
    let currentSelection = null;
    hookCreateSelectionEvents();
    hookMoveSelectionEvents();
    hookOnClickEvents();
    function hookCreateSelectionEvents() {
        const canvas = findCanvasElement();
        let isSelecting = false;
        canvas.addEventListener('pointerdown', e => {
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }
            canvas.setPointerCapture(e.pointerId);
            isSelecting = true;
            currentSelection = new Bounds({ x: e.offsetX, y: e.offsetY }, { x: e.offsetX, y: e.offsetY });
        });
        canvas.addEventListener('pointermove', e => {
            if (!isSelecting || !currentSelection) {
                return;
            }
            currentSelection = currentSelection.withEnd({
                x: e.offsetX,
                y: e.offsetY
            });
            updateSelectionElement(currentSelection);
        });
        canvas.addEventListener('pointerup', e => {
            canvas.releasePointerCapture(e.pointerId);
            if (isSelecting && currentSelection) {
                currentSelection = currentSelection.asNormalized();
            }
            isSelecting = false;
        });
    }
    function hookMoveSelectionEvents() {
        const toolbarElement = findToolbarElement();
        let isMoving = false;
        let moveOrigin = { x: 0, y: 0 };
        let originalSelection = null;
        toolbarElement.addEventListener('pointerdown', e => {
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }
            isMoving = true;
            moveOrigin = { x: e.screenX, y: e.screenY };
            originalSelection = currentSelection;
            toolbarElement.setPointerCapture(e.pointerId);
        });
        toolbarElement.addEventListener('pointermove', e => {
            if (!isMoving || !originalSelection) {
                return;
            }
            const moveOffset = {
                x: e.screenX - moveOrigin.x,
                y: e.screenY - moveOrigin.y
            };
            currentSelection = originalSelection.moveBy(moveOffset);
            updateSelectionElement(currentSelection);
        });
        toolbarElement.addEventListener('pointerup', e => {
            toolbarElement.releasePointerCapture(e.pointerId);
            isMoving = false;
            originalSelection = null;
        });
    }
    function hookOnClickEvents() {
        hookOnClick('ok', onZoom);
        hookOnClick('cancel', onCancelZoom);
        function onZoom() {
            if (!currentSelection) {
                return;
            }
            hideSelectionElement();
            const canvas = findCanvasElement();
            const worldBounds = new Bounds(viewState.canvasToWorld(currentSelection.topLeft, canvas), viewState.canvasToWorld(currentSelection.bottomRight, canvas));
            const aspectRatio = canvas.height / canvas.width;
            const newPosition = worldBounds.center;
            const newScale = (worldBounds.height > worldBounds.width
                ? worldBounds.height / aspectRatio
                : worldBounds.width);
            const zoomedViewState = viewState.withPosAndScale(newPosition, newScale);
            const searchParams = zoomedViewState.toURLSearchParams();
            window.location.search = searchParams.toString();
        }
        function onCancelZoom() {
            hideSelectionElement();
            currentSelection = null;
        }
        function hookOnClick(elementId, onClick) {
            const element = findElementById(elementId, HTMLElement);
            element.addEventListener('click', e => {
                e.preventDefault();
                onClick(e);
                return false;
            });
        }
    }
    function findCanvasElement() {
        return findElementById(canvasElementId, HTMLCanvasElement);
    }
    function findSelectionElement() {
        return findElementById(selectionElementId, HTMLElement);
    }
    function findToolbarElement() {
        return findElementBySelector(`#${selectionElementId} .selectionToolbar`, HTMLElement);
    }
    function updateSelectionElement(selection) {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';
        const topLeft = selection.topLeft;
        const w = selection.width;
        const h = selection.height;
        selectionElement.style.left = px(topLeft.x);
        selectionElement.style.top = px(topLeft.y);
        selectionElement.style.width = px(w);
        selectionElement.style.height = px(h);
    }
    function hideSelectionElement() {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    }
}
