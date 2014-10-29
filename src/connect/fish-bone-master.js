/**
 * @fileOverview
 *
 * 鱼骨头主干连线
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerConnectProvider('fish-bone-master', function(node, parent, connection) {

    var pout = parent.getLayoutVertexOut(),
        pin = node.getLayoutVertexIn();

    var abs = Math.abs;

    var dy = abs(pout.y - pin.y),
        dx = abs(pout.x - pin.x);

    var pathData = [];

    pathData.push('M', pout.x, pout.y);
    pathData.push('h', dx - dy);
    pathData.push('L', pin.x, pin.y);

    connection.setMarker(null);
    connection.setPathData(pathData);
});