var connectMarker = new kity.Marker().pipe(function() {
    var r = 4;
    var dot = new kity.Circle(r);
    this.addShape(dot);
    this.setRef(r, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
    this.dot = dot;
});

KityMinder.registerConnectProvider('default', function(node, parent, connection, width, color) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();

    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = box.x > pBox.x ? 'right' : 'left';

    node.getMinder().getPaper().addResource(connectMarker);

    switch (node.getType()) {

        case 'main':

            start = new kity.Point(pBox.cx, pBox.cy);
            end = side == 'left' ?
                new kity.Point(box.right + 2, box.cy) :
                new kity.Point(box.left - 2, box.cy);

            vector = kity.Vector.fromPoints(start, end);
            pathData.push('M', start);
            pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);

            connection.setMarker(connectMarker);
            connectMarker.dot.fill(color);

            break;

        case 'sub':

            var radius = node.getStyle('connect-radius');
            var underY = box.bottom + 2;
            var startY = parent.getType() == 'sub' ? pBox.bottom + 2 : pBox.cy;
            var p1, p2, p3, mx;

            if (side == 'right') {
                p1 = new kity.Point(pBox.right + 10, startY);
                p2 = new kity.Point(box.left, underY);
                p3 = new kity.Point(box.right + 10.5, underY);
            } else {
                p1 = new kity.Point(pBox.left - 10, startY);
                p2 = new kity.Point(box.right, underY);
                p3 = new kity.Point(box.left - 10.5, underY);
            }

            mx = (p1.x + p2.x) / 2;

            pathData.push('M', p1);
            pathData.push('C', mx, p1.y, mx, p2.y, p2);
            pathData.push('L', p3);

            connection.setMarker(null);

            break;
    }

    connection.setPathData(pathData);
});