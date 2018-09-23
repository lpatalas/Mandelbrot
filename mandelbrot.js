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
///<reference path="complex.ts" />
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
