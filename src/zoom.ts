///<reference path="parameters.ts" />

interface Point {
    x: number;
    y: number;
}

class Bounds {
    get height() { return Math.abs(this.end.y - this.start.y); }
    get width() { return Math.abs(this.end.x - this.start.x); }

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

    constructor(
        readonly start: Point,
        readonly end: Point
    ) {
    }

    asNormalized() {
        return new Bounds(this.topLeft, this.bottomRight);
    }

    copy() {
        return new Bounds(this.start, this.end);
    }

    moveBy(offset: Point): Bounds {
        return new Bounds(
            { x: this.start.x + offset.x, y: this.start.y + offset.y },
            { x: this.end.x + offset.x, y: this.end.y + offset.y }
        )
    }

    withEnd(end: Point): Bounds {
        return new Bounds(this.start, end);
    }
}

function initializeZoom(parameters: Parameters, canvasElementId: string, selectionElementId: string) {
    const canvas = document.getElementById(canvasElementId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error(`Can't find canvas element: ${canvasElementId}`);
    }

    let isSelecting = false;
    // let startX: number;
    // let startY: number;
    // let endX: number;
    // let endY: number;
    let currentSelection = Bounds.empty;

    function findSelectionElement() {
        const selectionElement = document.getElementById(selectionElementId);
        if (!selectionElement) {
            throw new Error(`Can't find selection element: ${selectionElementId}`);
        }

        return selectionElement;
    }

    function updateSelection(selection: Bounds) {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';

        const topLeft = selection.topLeft;
        const w = selection.width;
        const h = selection.height;

        // const w = Math.max(selection.start.x, endX) - Math.min(startX, endX);
        // const h = Math.max(selection.start.x, endY) - Math.min(startY, endY);

        selectionElement.style.left = `${topLeft.x}px`;
        selectionElement.style.top = `${topLeft.y}px`;
        selectionElement.style.width = `${w}px`;
        selectionElement.style.height = `${h}px`;
    }

    canvas.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) {
            return;
        }

        console.log('pointerdown', e);
        canvas.setPointerCapture(e.pointerId);

        isSelecting = true;
        currentSelection = new Bounds(
            { x: e.offsetX, y: e.offsetY },
            { x: e.offsetX, y: e.offsetY }
        );

        // startX = e.offsetX;
        // startY = e.offsetY;
        // endX = startX;
        // endY = startY;
    });

    canvas.addEventListener('pointermove', e => {
        if (!isSelecting) {
            return;
        }

        const w = e.offsetX - currentSelection.start.x;
        const h = w * (canvas.height / canvas.width);
        const endY = currentSelection.start.y + h;

        currentSelection = currentSelection.withEnd({
            x: e.offsetX,
            y: endY
        });

        updateSelection(currentSelection);
    });

    canvas.addEventListener('pointerup', e => {
        canvas.releasePointerCapture(e.pointerId);
        isSelecting = false;
        currentSelection = currentSelection.asNormalized();
        console.log('Selection:', currentSelection);
    });

    const hideSelection = () => {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    }

    const onZoom = () => {
        const p = parameters;

        const xMin = currentSelection.start.x / canvas.width;
        const xMax = currentSelection.end.x / canvas.width;
        const yMin = currentSelection.start.y / canvas.height;
        const yMax = currentSelection.end.y / canvas.height;

        const xCenter = (xMin + (xMax - xMin) / 2) * 2 - 1;
        const yCenter = (yMin + (yMax - yMin) / 2) * 2 - 1;

        const aspect = canvas.height / canvas.width;
        const xx = p.position.x + xCenter * p.scale * 0.5;
        const yy = p.position.y + yCenter * p.scale * 0.5 * aspect;

        const s = (xMax - xMin) * p.scale;

        hideSelection();
        window.location.search = `?x=${xx}&y=${yy}&scale=${s}&maxIter=${p.maxIterations}`;
    }

    const onCancelZoom = () => {
        hideSelection();
    }

    const hookOnClick = (elementId: string, onClick: (e: MouseEvent) => void) => {
        const selector = `#${selectionElementId} #${elementId}`;
        const element = document.querySelector(selector);
        if (!element || !(element instanceof HTMLElement)) {
            throw new Error(`Can't find element: ${selector}`)
        }

        element.addEventListener('click', e => {
            e.preventDefault();
            onClick(e);
            return false;
        });
    }

    hookOnClick('ok', onZoom);
    hookOnClick('cancel', onCancelZoom);

    const toolbarSelector = `#${selectionElementId} .selectionToolbar`;
    const toolbarElement = document.querySelector(toolbarSelector);
    if (!toolbarElement || !(toolbarElement instanceof HTMLElement)) {
        throw new Error(`Can't get toolbar element: ${toolbarSelector}`);
    }

    let isMoving = false;
    let moveOrigin: Point = { x: 0, y: 0 };
    let originalSelection: Bounds = Bounds.empty;

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
        if (!isMoving) {
            return;
        }

        const moveOffset = {
            x: e.screenX - moveOrigin.x,
            y: e.screenY - moveOrigin.y
        };

        currentSelection = originalSelection.moveBy(moveOffset);
        updateSelection(currentSelection);
    })

    toolbarElement.addEventListener('pointerup', e => {
        isMoving = false;
        toolbarElement.releasePointerCapture(e.pointerId);
    })
}