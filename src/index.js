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
    Object.defineProperty(Bounds.prototype, "center", {
        get: function () {
            var topLeft = this.topLeft;
            var bottomRight = this.bottomRight;
            return {
                x: (bottomRight.x + topLeft.x) / 2,
                y: (bottomRight.y + topLeft.y) / 2
            };
        },
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
            var x = (value - 0.25) * 4;
            return {
                r: Math.floor(x * 192),
                g: Math.floor(x * 192),
                b: 255 - Math.floor(x * 255)
            };
        }
        else {
            var x = (value - 0.5) * 2;
            return {
                r: 192 - Math.floor(x * 192),
                g: 192,
                b: 0
            };
        }
    },
];
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
var MandelbrotSeries = /** @class */ (function () {
    function MandelbrotSeries() {
        this.a = 0;
        this.b = 0;
        this.aSquared = 0;
        this.bSquared = 0;
    }
    MandelbrotSeries.prototype.next = function (a, b) {
        var a2 = this.aSquared - this.bSquared;
        var b2 = 2 * this.a * this.b;
        this.a = a2 + a;
        this.b = b2 + b;
        this.aSquared = this.a * this.a;
        this.bSquared = this.b * this.b;
    };
    MandelbrotSeries.prototype.sqabs = function () {
        return this.aSquared * this.bSquared;
    };
    return MandelbrotSeries;
}());
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
    ViewState.prototype.canvasToWorld = function (canvasPos, canvasSize) {
        var aspectRatio = canvasSize.height / canvasSize.width;
        var x = (canvasPos.x / canvasSize.width - 0.5) * this.scale;
        var y = (canvasPos.y / canvasSize.height - 0.5) * this.scale * aspectRatio;
        return {
            x: x + this.position.x,
            y: y + this.position.y
        };
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
///<reference path="mandelbrotSeries.ts" />
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
        var Zn = new MandelbrotSeries();
        for (var iter = 0; iter < maxIterations; iter++) {
            Zn.next(x, y);
            if (Zn.sqabs() >= 4) {
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
            currentSelection = currentSelection.withEnd({
                x: e.offsetX,
                y: e.offsetY
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
            var worldBounds = new Bounds(viewState.canvasToWorld(currentSelection.topLeft, canvas), viewState.canvasToWorld(currentSelection.bottomRight, canvas));
            var aspectRatio = canvas.height / canvas.width;
            var newPosition = worldBounds.center;
            var newScale = (worldBounds.height > worldBounds.width
                ? worldBounds.height / aspectRatio
                : worldBounds.width);
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
