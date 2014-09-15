/**
 * @fileOverview
 *
 * 提供折线相连的方法
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerConnectProvider('poly', function(node, parent, connection, width) {

    // 连线起点和终点
    var po = parent.getLayoutVertexOut(),
        pi = node.getLayoutVertexIn();

    // 连线矢量和方向
    var v = parent.getLayoutVectorOut().normalize();

    var r = Math.round;
    var abs = Math.abs;

    var pathData = [];
    pathData.push('M', r(po.x), r(po.y));

    switch (true) {
        case abs(v.x) > abs(v.y) && v.x < 0:
            // left
            pathData.push('h', -parent.getStyle('margin-left'));
            pathData.push('v', pi.y - po.y);
            pathData.push('H', pi.x);
            break;

        case abs(v.x) > abs(v.y) && v.x >= 0:
            // right
            pathData.push('h', parent.getStyle('margin-right'));
            pathData.push('v', pi.y - po.y);
            pathData.push('H', pi.x);
            break;

        case abs(v.x) <= abs(v.y) && v.y < 0:
            // top
            pathData.push('v', -parent.getStyle('margin-top'));
            pathData.push('h', pi.x - po.x);
            pathData.push('V', pi.y);
            break;

        case abs(v.x) <= abs(v.y) && v.y >= 0:
            // bottom
            pathData.push('v', parent.getStyle('margin-bottom'));
            pathData.push('h', pi.x - po.x);
            pathData.push('V', pi.y);
            break;

    }

    connection.setMarker(null);
    connection.setPathData(pathData);
});