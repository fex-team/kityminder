/**
 * @fileOverview
 *
 * 提供折线相连的方法
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerConnectProvider('bezier', function(node, parent, connection) {

    // 连线起点和终点
    var po = parent.getLayoutVertexOut(),
        pi = node.getLayoutVertexIn();

    // 连线矢量和方向
    var v = parent.getLayoutVectorOut().normalize();

    var r = Math.round;
    var abs = Math.abs;

    var pathData = [];
    pathData.push('M', r(po.x), r(po.y));

    if (abs(v.x) > abs(v.y)) {
        // x - direction
        var hx = (pi.x + po.x) / 2;
        pathData.push('C', hx, po.y, hx, pi.y, pi.x, pi.y);
    } else {
        // y - direction
        var hy = (pi.y + po.y) / 2;
        pathData.push('C', po.x, hy, pi.x, hy, pi.x, pi.y);
    }

    connection.setMarker(null);
    connection.setPathData(pathData);
});