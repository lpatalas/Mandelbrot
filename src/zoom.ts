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

            const selectionElement = findSelectionElement();
            selectionElement.classList.remove('visible');

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

            const selectionElement = findSelectionElement();
            selectionElement.classList.add('visible');
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
            const worldBounds = new Bounds(
                viewState.canvasToWorld(currentSelection.topLeft, canvas),
                viewState.canvasToWorld(currentSelection.bottomRight, canvas)
            );

            const aspectRatio = canvas.height / canvas.width;
            const newPosition = worldBounds.center;
            const newScale = (
                worldBounds.height > worldBounds.width
                    ? worldBounds.height / aspectRatio
                    : worldBounds.width
            );

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
