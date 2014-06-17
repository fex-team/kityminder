var connectMarker = new kity.Marker().pipe(function() {
    var r = 4;
    var dot = new kity.Circle(r).fill('white');
    this.addShape(dot);
    this.setRef(r, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
});

KityMinder.registerConnectProvider('default', function(node, parent, connection) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();

    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = box.cx > pBox.cx ? 'right' : 'left';

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

            break;

        case 'sub':

            var radius = node.getStyle('connect-radius');
            var underY = box.bottom + 2;
            var p1, p2, p3, p4, v12;
            var isTop = parent.children.length > 1 && node.getIndex() === 0;

            if (side == 'right') {
                p1 = new kity.Point(pBox.right + parent.getStyle('margin-right'), pBox.cy);
                p3 = new kity.Point(box.left, underY);
                p4 = new kity.Point(box.right, underY);
                p2 = p3.offset(-radius, isTop ? radius : -radius);
            } else {
                p1 = new kity.Point(pBox.left - parent.getStyle('margin-left'), pBox.cy);
                p3 = new kity.Point(box.right, underY);
                p4 = new kity.Point(box.left, underY);
                p2 = p3.offset(radius, isTop ? radius : -radius);
            }

            v12 = kity.Vector.fromPoints(p1, p2);

            pathData.push('M', p1);
            //pathData.push('L', p2);
            // rx, ry, xr, laf, sf, p
            var sf = +(side == 'right' && isTop || side == 'left' && !isTop);
            pathData.push('L', p3);
            pathData.push('L', p4);
            //var ex = side == 'right' ? (start.x + radius) : (start.x - radius);

            connection.setMarker(null);

            break;
    }

    connection.setPathData(pathData);
});