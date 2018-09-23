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
function initializeZoom(parameters, canvasElementId, selectionElementId) {
    var canvas = document.getElementById(canvasElementId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Can't find canvas element: " + canvasElementId);
    }
    var isSelecting = false;
    var startX;
    var startY;
    var endX;
    var endY;
    function findSelectionElement() {
        var selectionElement = document.getElementById(selectionElementId);
        if (!selectionElement) {
            throw new Error("Can't find selection element: " + selectionElementId);
        }
        return selectionElement;
    }
    function updateSelection() {
        var selectionElement = findSelectionElement();
        selectionElement.style.display = 'block';
        var w = Math.max(startX, endX) - Math.min(startX, endX);
        var h = Math.max(startY, endY) - Math.min(startY, endY);
        selectionElement.style.left = Math.min(startX, endX) + "px";
        selectionElement.style.top = Math.min(startY, endY) + "px";
        selectionElement.style.width = w + "px";
        selectionElement.style.height = h + "px";
    }
    canvas.addEventListener('pointerdown', function (e) {
        canvas.setPointerCapture(e.pointerId);
        isSelecting = true;
        startX = e.offsetX;
        startY = e.offsetY;
        endX = startX;
        endY = startY;
    });
    canvas.addEventListener('pointermove', function (e) {
        if (!isSelecting) {
            return;
        }
        endX = e.offsetX;
        var w = endX - startX;
        var h = w * (canvas.height / canvas.width);
        endY = startY + h;
        updateSelection();
    });
    canvas.addEventListener('pointerup', function (e) {
        canvas.releasePointerCapture(e.pointerId);
        isSelecting = false;
        console.log({ startX: startX, startY: startY, endX: endX, endY: endY });
    });
    var hideSelection = function () {
        var selectionElement = findSelectionElement();
        selectionElement.style.display = 'none';
    };
    var onZoom = function () {
        var p = parameters;
        var xMin = Math.min(startX, endX) / canvas.width;
        var xMax = Math.max(startX, endX) / canvas.width;
        var yMin = Math.min(startY, endY) / canvas.height;
        var yMax = Math.max(startY, endY) / canvas.height;
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
}
