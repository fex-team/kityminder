KityMinder.Geometry = (function() {
    var g = {};
    var min = Math.min,
        max = Math.max,
        abs = Math.abs;
    var own = Object.prototype.hasOwnProperty;

    g.isNumberInRange = function(number, range) {
        return number > range[0] && number < range[1];
    };

    g.getDistance = function(p1, p2) {
        return kity.Vector.fromPoints(p1, p2).length();
    };

    function wrapBox(box) {
        box.width = box.right - box.left;
        box.height = box.bottom - box.top;
        box.x = box.left;
        box.y = box.top;
        box.cx = box.x + box.width / 2;
        box.cy = box.y + box.height / 2;
        return box;
    }

    function uniformBox(box) {
        // duck check
        if ('x' in box) {
            box.left = box.x;
            box.right = box.x + box.width;
            box.top = box.y;
            box.bottom = box.y + box.height;
        }
    }

    g.wrapBox = wrapBox;

    g.getBox = function(p1, p2) {
        return wrapBox({
            left: min(p1.x, p2.x),
            right: max(p1.x, p2.x),
            top: min(p1.y, p2.y),
            bottom: max(p1.y, p2.y)
        });
    };

    g.mergeBox = function(b1, b2) {
        uniformBox(b1);
        uniformBox(b2);
        return wrapBox({
            left: min(b1.left, b2.left),
            right: max(b1.right, b2.right),
            top: min(b1.top, b2.top),
            bottom: max(b1.bottom, b2.bottom)
        });
    };

    g.getBoxRange = function(box) {
        return {
            x: [box.left, box.right],
            y: [box.top, box.bottom]
        };
    };

    g.getBoxVertex = function(box) {
        return {
            leftTop: {
                x: box.left,
                y: box.top
            },
            rightTop: {
                x: box.right,
                y: box.top
            },
            leftBottom: {
                x: box.left,
                y: box.bottom
            },
            rightBottom: {
                x: box.right,
                y: box.bottom
            }
        };
    };

    g.isPointInsideBox = function(p, b) {
        uniformBox(b);
        var ranges = g.getBoxRange(b);
        return g.isNumberInRange(p.x, ranges.x) && g.isNumberInRange(p.y, ranges.y);
    };

    g.getIntersectBox = function(b1, b2) {
        uniformBox(b1);
        uniformBox(b2);
        var minx = max(b1.left, b2.left),
            miny = max(b1.top, b2.top),
            maxx = min(b1.right, b2.right),
            maxy = min(b1.bottom, b2.bottom);
        return minx < maxx && miny < maxy ? wrapBox({
            left: minx,
            right: maxx,
            top: miny,
            bottom: maxy
        }) : null;
    };

    g.snapToSharp = function(unknown) {
        if (utils.isNumber(unknown)) {
            return (unknown | 0) + 0.5;
        }
        if (utils.isArray(unknown)) {
            return unknown.map(g.snapToSharp);
        }
        ['x', 'y', 'left', 'top', 'right', 'bottom'].forEach(function(n) {
            if (own.call(unknown, n)) {
                unknown[n] = g.snapToSharp(unknown[n]);
            }
        });
        return unknown;
    };

    g.expandBox = function(box, sizeX, sizeY) {
        if (sizeY === undefined) {
            sizeY = sizeX;
        }
        return wrapBox({
            left: box.left - sizeX,
            top: box.top - sizeY,
            right: box.right + sizeX,
            bottom: box.bottom + sizeY
        });
    };

    return g;
})();