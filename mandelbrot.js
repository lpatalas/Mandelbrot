"use strict";
function drawMandelbrot(canvasElementId) {
    var canvas = document.getElementById(canvasElementId);
    var context = canvas.getContext('2d');
    if (!context) {
        console.error("Can't get canvas context");
        return;
    }
    var screenW = canvas.width;
    var screenH = canvas.height;
    var setPixel = function (x, y, color) {
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
    };
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
    var lerp = function (a, b, x) {
        return x < 0 ? a
            : x > 1 ? b
                : a + (x * (b - a));
    };
    var maxIterations = 100;
    var cxmin = -2.5;
    var cxmax = 1.5;
    var cymin = -1.25;
    var cymax = 1.25;
    for (var x = 0; x < screenW; x++) {
        for (var y = 0; y < screenH; y++) {
            var cx = lerp(cxmin, cxmax, x / screenW);
            var cy = lerp(cymin, cymax, y / screenH);
            var i = iterate(cx, cy, maxIterations);
            var c = lerp(0, 255, i / maxIterations);
            setPixel(x, y, "rgb(" + c + ", " + c + ", " + c + ")");
        }
    }
}
