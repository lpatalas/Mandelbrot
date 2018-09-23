"use strict";
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
var colorSchemes = [
    function (value) {
        var c = Math.floor(value * 255);
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
    }
];
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
function findElementById(id, elementType) {
    var element = document.getElementById(id);
    if (!element || !(element instanceof elementType)) {
        throw new Error("Can't find element: " + id);
    }
    return element;
}
function findElementBySelector(selector, elementType) {
    var element = document.querySelector(selector);
    if (!element || !(element instanceof elementType)) {
        throw new Error("Can't find element: " + selector);
    }
    return element;
}
function px(x) {
    return x + "px";
}
///<reference path="colorSchemes.ts" />
var ViewState = /** @class */ (function () {
    function ViewState(colorScheme, maxIterations, position, scale) {
        this.colorScheme = colorScheme;
        this.maxIterations = maxIterations;
        this.position = position;
        this.scale = scale;
    }
    ViewState.getCurrent = function () {
        var urlParams = new URLSearchParams(location.search.substr(1));
        return new ViewState(safeParseInt(urlParams.get('colorScheme'), 0) % colorSchemes.length, safeParseInt(urlParams.get('maxIter'), 50), {
            x: safeParseFloat(urlParams.get('x'), -0.5),
            y: safeParseFloat(urlParams.get('y'), 0)
        }, safeParseFloat(urlParams.get('scale'), 4));
    };
    ViewState.prototype.toURLSearchParams = function () {
        return new URLSearchParams({
            x: this.position.x.toString(),
            y: this.position.y.toString(),
            scale: this.scale.toString(),
            maxIter: this.maxIterations.toString(),
            colorScheme: this.colorScheme.toString()
        });
    };
    ViewState.prototype.withPosAndScale = function (position, scale) {
        return new ViewState(this.colorScheme, this.maxIterations, position, scale);
    };
    return ViewState;
}());
function safeParseInt(value, defaultValue) {
    return value ? parseInt(value, 10) : defaultValue;
}
function safeParseFloat(value, defaultValue) {
    return value ? parseFloat(value) : defaultValue;
}
var Stopwatch = /** @class */ (function () {
    function Stopwatch(label) {
        this.label = label;
        console.time(label);
    }
    Stopwatch.prototype.stop = function () {
        console.timeEnd(this.label);
    };
    return Stopwatch;
}());
///<reference path="complex.ts" />
///<reference path="viewState.ts" />
///<reference path="colorSchemes.ts" />
///<reference path="stopwatch.ts" />
function drawMandelbrot(canvasElementId, viewState) {
    var context = createRenderingContext();
    var iterations = computeMandelbrot(viewState, context.canvas);
    renderMandelbrot(context, iterations);
    function createRenderingContext() {
        var canvas = document.getElementById(canvasElementId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Can't find canvas using selector: " + canvasElementId);
        }
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        var context = canvas.getContext('2d');
        if (!context) {
            throw new Error("Can't get canvas context");
        }
        return context;
    }
    function computeMandelbrot(viewState, canvasSize) {
        var sw = new Stopwatch("computeMandelbrot");
        var width = canvasSize.width, height = canvasSize.height;
        var position = viewState.position, scale = viewState.scale;
        var aspectRatio = height / width;
        var xMin = position.x - scale / 2;
        var xMax = position.x + scale / 2;
        var yMin = position.y - scale / 2 * aspectRatio;
        var yMax = position.y + scale / 2 * aspectRatio;
        var values = new Array(width * height);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var cx = lerp(xMin, xMax, x / width);
                var cy = lerp(yMin, yMax, y / height);
                var i = computePoint(cx, cy, viewState.maxIterations);
                values[x + y * width] = i;
            }
        }
        sw.stop();
        return values;
    }
    function computePoint(x, y, maxIterations) {
        var Zn = { a: 0, b: 0 };
        for (var iter = 0; iter < maxIterations; iter++) {
            Zn = cadd(csquare(Zn), { a: x, b: y });
            if (cabs(Zn) >= 2) {
                return iter;
            }
        }
        return maxIterations;
    }
    ;
    function renderMandelbrot(context, iterations) {
        var sw = new Stopwatch("renderMandelbrot");
        var _a = context.canvas, width = _a.width, height = _a.height;
        var imageData = context.getImageData(0, 0, width, height);
        var colorInterpolator = colorSchemes[viewState.colorScheme];
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var iterCount = iterations[x + y * width];
                var iterFactor = iterCount / viewState.maxIterations;
                var i = (x + y * width) * 4;
                var color = colorInterpolator(iterFactor);
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
    var currentSelection = null;
    hookCreateSelectionEvents();
    hookMoveSelectionEvents();
    hookOnClickEvents();
    function hookCreateSelectionEvents() {
        var canvas = findCanvasElement();
        var isSelecting = false;
        canvas.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }
            canvas.setPointerCapture(e.pointerId);
            isSelecting = true;
            currentSelection = new Bounds({ x: e.offsetX, y: e.offsetY }, { x: e.offsetX, y: e.offsetY });
        });
        canvas.addEventListener('pointermove', function (e) {
            if (!isSelecting || !currentSelection) {
                return;
            }
            var canvasAspectRatio = canvas.height / canvas.width;
            var newSelectionWidth = e.offsetX - currentSelection.start.x;
            var newSelectionHeight = newSelectionWidth * canvasAspectRatio;
            currentSelection = currentSelection.withEnd({
                x: e.offsetX,
                y: currentSelection.start.y + newSelectionHeight
            });
            updateSelectionElement(currentSelection);
        });
        canvas.addEventListener('pointerup', function (e) {
            canvas.releasePointerCapture(e.pointerId);
            if (isSelecting && currentSelection) {
                currentSelection = currentSelection.asNormalized();
            }
            isSelecting = false;
        });
    }
    function hookMoveSelectionEvents() {
        var toolbarElement = findToolbarElement();
        var isMoving = false;
        var moveOrigin = { x: 0, y: 0 };
        var originalSelection = null;
        toolbarElement.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }
            isMoving = true;
            moveOrigin = { x: e.screenX, y: e.screenY };
            originalSelection = currentSelection;
            toolbarElement.setPointerCapture(e.pointerId);
        });
        toolbarElement.addEventListener('pointermove', function (e) {
            if (!isMoving || !originalSelection) {
                return;
            }
            var moveOffset = {
                x: e.screenX - moveOrigin.x,
                y: e.screenY - moveOrigin.y
            };
            currentSelection = originalSelection.moveBy(moveOffset);
            updateSelectionElement(currentSelection);
        });
        toolbarElement.addEventListener('pointerup', function (e) {
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
            var canvas = findCanvasElement();
            var xMin = currentSelection.start.x / canvas.width;
            var xMax = currentSelection.end.x / canvas.width;
            var yMin = currentSelection.start.y / canvas.height;
            var yMax = currentSelection.end.y / canvas.height;
            var xCenter = (xMin + (xMax - xMin) / 2) * 2 - 1;
            var yCenter = (yMin + (yMax - yMin) / 2) * 2 - 1;
            var position = viewState.position, scale = viewState.scale;
            var aspectRatio = canvas.height / canvas.width;
            var newPosition = {
                x: position.x + xCenter * scale * 0.5,
                y: position.y + yCenter * scale * 0.5 * aspectRatio
            };
            var newScale = (xMax - xMin) * scale;
            var zoomedViewState = viewState.withPosAndScale(newPosition, newScale);
            var searchParams = zoomedViewState.toURLSearchParams();
            window.location.search = searchParams.toString();
        }
        function onCancelZoom() {
            hideSelectionElement();
            currentSelection = null;
        }
        function hookOnClick(elementId, onClick) {
            var element = findElementById(elementId, HTMLElement);
            element.addEventListener('click', function (e) {
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
        return findElementBySelector("#" + selectionElementId + " .selectionToolbar", HTMLElement);
    }
    function updateSelectionElement(selection) {
        var selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';
        var topLeft = selection.topLeft;
        var w = selection.width;
        var h = selection.height;
        selectionElement.style.left = px(topLeft.x);
        selectionElement.style.top = px(topLeft.y);
        selectionElement.style.width = px(w);
        selectionElement.style.height = px(h);
    }
    function hideSelectionElement() {
        var selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    }
}
