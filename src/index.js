"use strict";
var cadd = function (c1, c2) {
    return {
        a: c1.a + c2.a,
        b: c1.b + c2.b
    };
};
var csquare = function (c) {
    return {
        a: c.a * c.a - c.b * c.b,
        b: 2 * c.a * c.b
    };
};
var cabs = function (c) {
    return Math.sqrt(c.a * c.a + c.b * c.b);
};
function safeParseInt(value, defaultValue) {
    return value ? parseInt(value, 10) : defaultValue;
}
function safeParseFloat(value, defaultValue) {
    return value ? parseFloat(value) : defaultValue;
}
function getCurrentParameters() {
    var urlParams = new URLSearchParams(location.search.substr(1));
    return {
        maxIterations: safeParseInt(urlParams.get('maxIter'), 50),
        position: {
            x: safeParseFloat(urlParams.get('x'), -0.5),
            y: safeParseFloat(urlParams.get('y'), 0)
        },
        scale: safeParseFloat(urlParams.get('scale'), 4)
    };
}
///<reference path="complex.ts" />
///<reference path="parameters.ts" />
var lerp = function (a, b, x) {
    return x < 0 ? a
        : x > 1 ? b
            : a + (x * (b - a));
};
function drawMandelbrot(containerElementId, parameters) {
    var container = document.querySelector(containerElementId);
    if (!container) {
        throw new Error("Can't find container element '" + containerElementId + "'");
    }
    var canvasSelector = containerElementId + " > canvas";
    var canvasElement = document.querySelector(canvasSelector);
    if (!canvasElement) {
        throw new Error("Can't find canvas using selector: " + canvasSelector);
    }
    var canvas = canvasElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    var context = canvas.getContext('2d');
    if (!context) {
        console.error("Can't get canvas context");
        return;
    }
    var iterate = function (x, y, maxIterations) {
        var Zn = { a: 0, b: 0 };
        for (var iter = 0; iter < maxIterations; iter++) {
            Zn = cadd(csquare(Zn), { a: x, b: y });
            if (cabs(Zn) >= 2) {
                return iter;
            }
        }
        return maxIterations;
    };
    function computeMandelbrot(parameters, screenW, screenH) {
        console.time("CalculateMandelbrot");
        var aspectRatio = screenH / screenW;
        var cxmin = parameters.position.x - parameters.scale / 2;
        var cxmax = parameters.position.x + parameters.scale / 2;
        var cymin = parameters.position.y - parameters.scale / 2 * aspectRatio;
        var cymax = parameters.position.y + parameters.scale / 2 * aspectRatio;
        var values = new Array(screenW * screenH);
        for (var y = 0; y < screenH; y++) {
            for (var x = 0; x < screenW; x++) {
                var cx = lerp(cxmin, cxmax, x / screenW);
                var cy = lerp(cymin, cymax, y / screenH);
                var i = iterate(cx, cy, parameters.maxIterations);
                values[x + y * screenW] = i;
            }
        }
        console.timeEnd("CalculateMandelbrot");
        return values;
    }
    function renderMandelbrot(context, values) {
        console.time("RenderMandelbrot");
        var screenW = context.canvas.width;
        var screenH = context.canvas.height;
        var imageData = context.getImageData(0, 0, screenW, screenH);
        for (var y = 0; y < screenH; y++) {
            for (var x = 0; x < screenW; x++) {
                var value = values[x + y * screenW];
                var c = Math.floor(lerp(0, 255, value / parameters.maxIterations));
                var i = (x + y * screenW) * 4;
                imageData.data[i] = c;
                imageData.data[i + 1] = c;
                imageData.data[i + 2] = c;
                imageData.data[i + 3] = 255;
            }
        }
        context.putImageData(imageData, 0, 0);
        console.timeEnd("RenderMandelbrot");
    }
    var values = computeMandelbrot(parameters, canvas.width, canvas.height);
    renderMandelbrot(context, values);
}
///<reference path="parameters.ts" />
var Bounds = /** @class */ (function () {
    function Bounds(start, end) {
        this.start = start;
        this.end = end;
    }
    Object.defineProperty(Bounds.prototype, "height", {
        get: function () { return Math.abs(this.end.y - this.start.y); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bounds.prototype, "width", {
        get: function () { return Math.abs(this.end.x - this.start.x); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bounds.prototype, "topLeft", {
        get: function () {
            return {
                x: Math.min(this.start.x, this.end.x),
                y: Math.min(this.start.y, this.end.y),
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bounds.prototype, "bottomRight", {
        get: function () {
            return {
                x: Math.max(this.start.x, this.end.x),
                y: Math.max(this.start.y, this.end.y),
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bounds, "empty", {
        get: function () {
            return new Bounds({ x: 0, y: 0 }, { x: 0, y: 0 });
        },
        enumerable: true,
        configurable: true
    });
    Bounds.prototype.asNormalized = function () {
        return new Bounds(this.topLeft, this.bottomRight);
    };
    Bounds.prototype.copy = function () {
        return new Bounds(this.start, this.end);
    };
    Bounds.prototype.moveBy = function (offset) {
        return new Bounds({ x: this.start.x + offset.x, y: this.start.y + offset.y }, { x: this.end.x + offset.x, y: this.end.y + offset.y });
    };
    Bounds.prototype.withEnd = function (end) {
        return new Bounds(this.start, end);
    };
    return Bounds;
}());
function initializeZoom(parameters, canvasElementId, selectionElementId) {
    var canvas = document.getElementById(canvasElementId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Can't find canvas element: " + canvasElementId);
    }
    var isSelecting = false;
    // let startX: number;
    // let startY: number;
    // let endX: number;
    // let endY: number;
    var currentSelection = Bounds.empty;
    function findSelectionElement() {
        var selectionElement = document.getElementById(selectionElementId);
        if (!selectionElement) {
            throw new Error("Can't find selection element: " + selectionElementId);
        }
        return selectionElement;
    }
    function updateSelection(selection) {
        var selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';
        var topLeft = selection.topLeft;
        var w = selection.width;
        var h = selection.height;
        // const w = Math.max(selection.start.x, endX) - Math.min(startX, endX);
        // const h = Math.max(selection.start.x, endY) - Math.min(startY, endY);
        selectionElement.style.left = topLeft.x + "px";
        selectionElement.style.top = topLeft.y + "px";
        selectionElement.style.width = w + "px";
        selectionElement.style.height = h + "px";
    }
    canvas.addEventListener('pointerdown', function (e) {
        canvas.setPointerCapture(e.pointerId);
        isSelecting = true;
        currentSelection = new Bounds({ x: e.offsetX, y: e.offsetY }, { x: e.offsetX, y: e.offsetY });
        // startX = e.offsetX;
        // startY = e.offsetY;
        // endX = startX;
        // endY = startY;
    });
    canvas.addEventListener('pointermove', function (e) {
        if (!isSelecting) {
            return;
        }
        var w = e.offsetX - currentSelection.start.x;
        var h = w * (canvas.height / canvas.width);
        var endY = currentSelection.start.y + h;
        currentSelection = currentSelection.withEnd({
            x: e.offsetX,
            y: endY
        });
        updateSelection(currentSelection);
    });
    canvas.addEventListener('pointerup', function (e) {
        canvas.releasePointerCapture(e.pointerId);
        isSelecting = false;
        currentSelection = currentSelection.asNormalized();
        console.log('Selection:', currentSelection);
    });
    var hideSelection = function () {
        var selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    };
    var onZoom = function () {
        var p = parameters;
        var xMin = currentSelection.start.x / canvas.width;
        var xMax = currentSelection.end.x / canvas.width;
        var yMin = currentSelection.start.y / canvas.height;
        var yMax = currentSelection.end.y / canvas.height;
        var xCenter = (xMin + (xMax - xMin) / 2) * 2 - 1;
        var yCenter = (yMin + (yMax - yMin) / 2) * 2 - 1;
        var aspect = canvas.height / canvas.width;
        var xx = p.position.x + xCenter * p.scale * 0.5;
        var yy = p.position.y + yCenter * p.scale * 0.5 * aspect;
        var s = (xMax - xMin) * p.scale;
        window.location.search = "?x=" + xx + "&y=" + yy + "&scale=" + s + "&maxIter=" + p.maxIterations;
    };
    var onCancelZoom = function () {
        hideSelection();
    };
    var hookOnClick = function (elementId, onClick) {
        var selector = "#" + selectionElementId + " #" + elementId;
        var element = document.querySelector(selector);
        if (!element || !(element instanceof HTMLElement)) {
            throw new Error("Can't find element: " + selector);
        }
        element.addEventListener('click', function (e) {
            e.preventDefault();
            onClick(e);
            return false;
        });
    };
    hookOnClick('ok', onZoom);
    hookOnClick('cancel', onCancelZoom);
    var toolbarSelector = "#" + selectionElementId + " .selectionToolbar";
    var toolbarElement = document.querySelector(toolbarSelector);
    if (!toolbarElement || !(toolbarElement instanceof HTMLElement)) {
        throw new Error("Can't get toolbar element: " + toolbarSelector);
    }
    var isMoving = false;
    var moveOrigin = { x: 0, y: 0 };
    var originalSelection = Bounds.empty;
    toolbarElement.addEventListener('pointerdown', function (e) {
        if (isMoving) {
            return;
        }
        isMoving = true;
        moveOrigin = { x: e.screenX, y: e.screenY };
        originalSelection = currentSelection;
        toolbarElement.setPointerCapture(e.pointerId);
    });
    toolbarElement.addEventListener('pointermove', function (e) {
        if (!isMoving) {
            return;
        }
        var moveOffset = {
            x: e.screenX - moveOrigin.x,
            y: e.screenY - moveOrigin.y
        };
        currentSelection = originalSelection.moveBy(moveOffset);
        updateSelection(currentSelection);
    });
    toolbarElement.addEventListener('pointerup', function (e) {
        isMoving = false;
        toolbarElement.releasePointerCapture(e.pointerId);
    });
}
