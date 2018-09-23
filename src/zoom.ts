///<reference path="viewState.ts" />
///<reference path="bounds.ts" />
///<reference path="domHelpers.ts" />

function initializeZoom(viewState: ViewState, canvasElementId: string, selectionElementId: string) {
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
            
            hideSelectionElement();
            
            const canvas = findCanvasElement();
            
            const xMin = currentSelection.start.x / canvas.width;
            const xMax = currentSelection.end.x / canvas.width;
            const yMin = currentSelection.start.y / canvas.height;
            const yMax = currentSelection.end.y / canvas.height;
            
            const xCenter = (xMin + (xMax - xMin) / 2) * 2 - 1;
            const yCenter = (yMin + (yMax - yMin) / 2) * 2 - 1;
            
            const { position, scale } = viewState;
            const aspectRatio = canvas.height / canvas.width;
            const newPosition = {
                x: position.x + xCenter * scale * 0.5,
                y: position.y + yCenter * scale * 0.5 * aspectRatio
            };
            const newScale = (xMax - xMin) * scale;
            
            const zoomedViewState = viewState.withPosAndScale(newPosition, newScale);
            const searchParams = zoomedViewState.toURLSearchParams();
            window.location.search = searchParams.toString();
        }
    
        function onCancelZoom() {
            hideSelectionElement();
            currentSelection = null;
        }

        function hookOnClick(elementId: string, onClick: (e: MouseEvent) => void) {
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

    function updateSelectionElement(selection: Bounds) {
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