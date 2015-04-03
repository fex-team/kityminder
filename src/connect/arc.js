/**
 * @fileOverview
 *
 * 圆弧连线
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

var connectMarker = new kity.Marker().pipe(function() {
    var r = 7;
    var dot = new kity.Circle(r - 1);
    this.addShape(dot);
    this.setRef(r - 1, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
    this.dot = dot;
    this.node.setAttribute('markerUnits', 'userSpaceOnUse');
});

KityMinder.registerConnectProvider('arc', function(node, parent, connection, width, color) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();

    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = box.x > pBox.x ? 'right' : 'left';

    node.getMinder().getPaper().addResource(connectMarker);

    start = new kity.Point(pBox.cx, pBox.cy);
    end = side == 'left' ?
        new kity.Point(box.right + 2, box.cy) :
        new kity.Point(box.left - 2, box.cy);

    vector = kity.Vector.fromPoints(start, end);
    pathData.push('M', start);
    pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);

    connection.setMarker(connectMarker);
    connectMarker.dot.fill(color);

    connection.setPathData(pathData);
});