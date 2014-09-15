/**
 * @fileOverview
 *
 * "L" 连线
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerConnectProvider('l', function(node, parent, connection) {

    var po = parent.getLayoutVertexOut();
    var pi = node.getLayoutVertexIn();
    var vo = parent.getLayoutVectorOut();

    var pathData = [];
    var r = Math.round,
        abs = Math.abs;

    pathData.push('M', po.round());
    if (abs(vo.x) > abs(vo.y)) {
        pathData.push('H', r(pi.x));
    } else {
        pathData.push('V', pi.y);
    }
    pathData.push('L', pi);

    connection.setPathData(pathData);
});