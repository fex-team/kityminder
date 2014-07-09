/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('bottom', kity.createClass({

    base: Layout,

    doLayout: function(node) {

        var children = node.getChildren();

        if (!children.length) {
            return false;
        }

        var me = this;

        // 子树的总宽度（包含间距）
        var totalTreeWidth = 0;

        // 父亲所占的区域
        var nodeContentBox = node.getContentBox();

        // 为每一颗子树准备的迭代变量
        var i, x0, x, y, child, childTreeBox, childContentBox, matrix;

        // 先最左对齐
        x0 = x = nodeContentBox.left;

        for (i = 0; i < children.length; i++) {

            child = children[i];
            childContentBox = child.getContentBox();
            childTreeBox = this.getTreeBox(child);
            matrix = new kity.Matrix();

            // 忽略无宽度的节点（收起的）
            if (!childContentBox.width) continue;

            if (i > 0) {
                x += child.getStyle('margin-left');
            }

            x -= childTreeBox.left;

            // arrange x
            matrix.translate(x, 0);

            // 为下个位置准备
            x += childTreeBox.right;

            if (i < children.length - 1) x += child.getStyle('margin-right');

            y = nodeContentBox.bottom - childTreeBox.top +
                node.getStyle('margin-bottom') + child.getStyle('margin-top');

            matrix.translate(0, y);

            // 设置结果
            child.setLayoutTransform(matrix);
            child.setVertexIn(new kity.Point(childContentBox.cx, childContentBox.top));

        }

        // 设置布局矢量为向下
        node.setLayoutVector(new kity.Vector(0, 1));

        // 设置流出顶点
        node.setVertexOut(new kity.Point(nodeContentBox.cx, nodeContentBox.bottom));

        var dx = (x - x0 - nodeContentBox.width) / 2;

        children.forEach(function(child) {
            child.getLayoutTransform().translate(-dx, 0);
        });
    },

    getOrderHint: function(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = 3;

        hint.push({
            type: 'up',
            node: node,
            area: {
                x: box.left - node.getStyle('margin-left') - offset,
                y: box.top,
                width: node.getStyle('margin-left'),
                height: box.height
            },
            path: ['M', box.left - offset, box.top, 'L', box.left - offset, box.bottom]
        });

        hint.push({
            type: 'down',
            node: node,
            area: {
                x: box.right + offset,
                y: box.top,
                width: node.getStyle('margin-right'),
                height: box.height
            },
            path: ['M', box.right + offset, box.top, 'L', box.right + offset, box.bottom]
        });
        return hint;
    }
}));

KityMinder.registerConnectProvider('bottom', function(node, parent, connection) {
    var pout = parent.getLayoutVertexOut(),
        pin = node.getLayoutVertexIn();
    var pathData = [];
    var r = Math.round;
    pathData.push('M', new kity.Point(r(pout.x), pout.y));
    pathData.push('L', new kity.Point(r(pout.x), pout.y + parent.getStyle('margin-bottom')));
    pathData.push('L', new kity.Point(r(pin.x), pout.y + parent.getStyle('margin-bottom')));
    pathData.push('L', new kity.Point(r(pin.x), pin.y));
    connection.setMarker(null);
    connection.setPathData(pathData);
});