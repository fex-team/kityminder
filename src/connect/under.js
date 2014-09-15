/**
 * @fileOverview
 *
 * 下划线连线
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerConnectProvider('under', function(node, parent, connection, width, color) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();

    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = box.x > pBox.x ? 'right' : 'left';


    var radius = node.getStyle('connect-radius');
    var underY = box.bottom + 3;
    var startY = parent.getType() == 'sub' ? pBox.bottom + 3 : pBox.cy;
    var p1, p2, p3, mx;

    if (side == 'right') {
        p1 = new kity.Point(pBox.right + 10, startY);
        p2 = new kity.Point(box.left, underY);
        p3 = new kity.Point(box.right + 10, underY);
    } else {
        p1 = new kity.Point(pBox.left - 10, startY);
        p2 = new kity.Point(box.right, underY);
        p3 = new kity.Point(box.left - 10, underY);
    }

    mx = (p1.x + p2.x) / 2;

    pathData.push('M', p1);
    pathData.push('C', mx, p1.y, mx, p2.y, p2);
    pathData.push('L', p3);

    connection.setMarker(null);

    connection.setPathData(pathData);
});