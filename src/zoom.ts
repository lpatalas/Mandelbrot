///<reference path="parameters.ts" />

function initializeZoom(parameters: Parameters, canvasElementId: string, selectionElementId: string) {
    const canvas = document.getElementById(canvasElementId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error(`Can't find canvas element: ${canvasElementId}`);
    }

    let isSelecting = false;
    let startX: number;
    let startY: number;
    let endX: number;
    let endY: number;

    function findSelectionElement() {
        const selectionElement = document.getElementById(selectionElementId);
        if (!selectionElement) {
            throw new Error(`Can't find selection element: ${selectionElementId}`);
        }

        return selectionElement;
    }

    function updateSelection() {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';

        const w = Math.max(startX, endX) - Math.min(startX, endX);
        const h = Math.max(startY, endY) - Math.min(startY, endY);

        selectionElement.style.left = `${Math.min(startX, endX)}px`;
        selectionElement.style.top = `${Math.min(startY, endY)}px`;
        selectionElement.style.width = `${w}px`;
        selectionElement.style.height = `${h}px`;
    }

    canvas.addEventListener('pointerdown', e => {
        canvas.setPointerCapture(e.pointerId);

        isSelecting = true;
        startX = e.offsetX;
        startY = e.offsetY;
        endX = startX;
        endY = startY;
    });

    canvas.addEventListener('pointermove', e => {
        if (!isSelecting) {
            return;
        }

        endX = e.offsetX;

        const w = endX - startX;
        const h = w * (canvas.height / canvas.width);
        endY = startY + h;

        updateSelection()
    });

    canvas.addEventListener('pointerup', e => {
        canvas.releasePointerCapture(e.pointerId);
        isSelecting = false;

        console.log({ startX, startY, endX, endY });
    });

    const hideSelection = () => {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    }

    const onZoom = () => {
        const p = parameters;

        const xMin = Math.min(startX, endX) / canvas.width;
        const xMax = Math.max(startX, endX) / canvas.width;
        const yMin = Math.min(startY, endY) / canvas.height;
        const yMax = Math.max(startY, endY) / canvas.height;

        const xCenter = (xMin + (xMax - xMin) / 2) * 2 - 1;
        const yCenter = (yMin + (yMax - yMin) / 2) * 2 - 1;

        const aspect = canvas.height / canvas.width;
        const xx = p.position.x + xCenter * p.scale * 0.5;
        const yy = p.position.y + yCenter * p.scale * 0.5 * aspect;

        const s = (xMax - xMin) * p.scale;
        window.location.search = `?x=${xx}&y=${yy}&scale=${s}&maxIter=${p.maxIterations}`;
    }

    const onCancelZoom = () => {
        hideSelection();
    }

    const hookOnClick = (buttonId: string, onClick: (e: MouseEvent) => void) => {
        const selector = `#${selectionElementId} input[type='button']#${buttonId}`;
        const inputElement = document.querySelector(selector);
        if (!inputElement || !(inputElement instanceof HTMLInputElement)) {
            throw new Error(`Can't find input element: ${selector}`)
        }

        inputElement.addEventListener('click', onClick);
    }

    hookOnClick('ok', onZoom);
    hookOnClick('cancel', onCancelZoom);
}