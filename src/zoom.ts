///<reference path="parameters.ts" />
///<reference path="bounds.ts" />

function initializeZoom(parameters: Parameters, canvasElementId: string, selectionElementId: string) {
    let currentSelection: Bounds | null = null;

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
            currentSelection = new Bounds(
                { x: e.offsetX, y: e.offsetY },
                { x: e.offsetX, y: e.offsetY }
            );
        });
    
        canvas.addEventListener('pointermove', e => {
            if (!isSelecting || !currentSelection) {
                return;
            }
    
            const canvasAspectRatio = canvas.height / canvas.width;
            const newSelectionWidth = e.offsetX - currentSelection.start.x;
            const newSelectionHeight = newSelectionWidth * canvasAspectRatio;
    
            currentSelection = currentSelection.withEnd({
                x: e.offsetX,
                y: currentSelection.start.y + newSelectionHeight
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
        let moveOrigin: Point = { x: 0, y: 0 };
        let originalSelection: Bounds | null = null;
    
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
            
            const p = parameters;
    
            const canvas = findCanvasElement();
    
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
    
            hideSelectionElement();
            window.location.search = `?x=${xx}&y=${yy}&scale=${s}&maxIter=${p.maxIterations}&colorScheme=${p.colorScheme}`;
        }
    
        function onCancelZoom() {
            hideSelectionElement();
            currentSelection = null;
        }

        function hookOnClick(elementId: string, onClick: (e: MouseEvent) => void) {
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
    }

    function findCanvasElement() {
        const canvas = document.getElementById(canvasElementId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Can't find canvas element: ${canvasElementId}`);
        }
        return canvas;
    }

    function findSelectionElement() {
        const selectionElement = document.getElementById(selectionElementId);
        if (!selectionElement) {
            throw new Error(`Can't find selection element: ${selectionElementId}`);
        }

        return selectionElement;
    }

    function findToolbarElement() {
        const toolbarSelector = `#${selectionElementId} .selectionToolbar`;
        const toolbarElement = document.querySelector(toolbarSelector);
        if (!toolbarElement || !(toolbarElement instanceof HTMLElement)) {
            throw new Error(`Can't get toolbar element: ${toolbarSelector}`);
        }
        return toolbarElement;
    }

    function updateSelectionElement(selection: Bounds) {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';

        const topLeft = selection.topLeft;
        const w = selection.width;
        const h = selection.height;

        selectionElement.style.left = `${topLeft.x}px`;
        selectionElement.style.top = `${topLeft.y}px`;
        selectionElement.style.width = `${w}px`;
        selectionElement.style.height = `${h}px`;
    }

    function hideSelectionElement() {
        const selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    }
}