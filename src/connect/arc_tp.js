/**
 *
 * 圆弧连线
 *
 * @author: along
 * @copyright: bpd729@163.com , 2015
 */

var connectMarker = new kity.Marker().pipe(function () {
    var r = 7;
    var dot = new kity.Circle(r - 1);
    this.addShape(dot);
    this.setRef(r - 1, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
    this.dot = dot;
    this.node.setAttribute('markerUnits', 'userSpaceOnUse');
});

KityMinder.registerConnectProvider('arc_tp', function (node, parent, connection, width, color) {
    var end_box = node.getLayoutBox(),
        start_box = parent.getLayoutBox();


    if (node.getIndex() > 0) {
        var index = node.getIndex();
        start_box = parent.getChildren()[index - 1].getLayoutBox();
    }


    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = end_box.x > start_box.x ? 'right' : 'left';

    node.getMinder().getPaper().addResource(connectMarker);


    start = new kity.Point(start_box.cx, start_box.cy);
    end = new kity.Point(end_box.cx, end_box.cy);

    var jl = Math.sqrt(Math.abs(start.x - end.x) * Math.abs(start.x - end.x) + Math.abs(start.y - end.y) * Math.abs(start.y - end.y)); //两圆中心点距离

    jl = node.getIndex() == 0 ? jl * 0.4 : jl;

    vector = kity.Vector.fromPoints(start, end);
    pathData.push('M', start);
    pathData.push('A', jl, jl, 0, 0, 1, end);

    connection.setMarker(connectMarker);
    connectMarker.dot.fill(color);

    connection.setPathData(pathData);
});