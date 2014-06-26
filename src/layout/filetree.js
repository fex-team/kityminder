/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('filetree', kity.createClass({
    base: Layout,

    doLayout: function(node) {
        var layout = this;

        if (node.isLayoutRoot()) {
            this.doLayoutRoot(node);
        } else {
            this.arrange(node);
        }
    },
    doLayoutRoot: function(root) {
        this.arrange(root);
    },
    arrange: function(node) {
        var children = node.getChildren();
        var _this = this;
        if (!children.length) {
            return false;
        } else {
            var totalTreeWidth = 0;
            // 计算每个 child 的树所占的矩形区域
            var childTreeBoxes = children.map(function(node, index, children) {
                var box = _this.getTreeBox([node]);
                return box;
            });
            var nodeContentBox = node.getContentBox();
            node.setLayoutVector(new kity.Vector(nodeContentBox.left + 6, nodeContentBox.bottom));
            var i, x, y, child, childTreeBox, childContentBox;
            var transform = new kity.Matrix();
            y = nodeContentBox.bottom + node.getStyle('margin-bottom');

            for (var i = 0; i < children.length; i++) {
                child = children[i];
                childTreeBox = childTreeBoxes[i];
                childContentBox = child.getContentBox();
                if (!childContentBox.width) continue;
                x = 10;
                y += child.getStyle('margin-top');
                child.setLayoutTransform(new kity.Matrix().translate(x, y));
                y += childTreeBox.height + children[i].getStyle('margin-bottom');
            }
        }
    },
    getOrderHint: function(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = node.getLevel() > 1 ? 3 : 5;

        hint.push({
            type: 'up',
            node: node,
            area: {
                x: box.x,
                y: box.top - node.getStyle('margin-top') - offset,
                width: box.width,
                height: node.getStyle('margin-top')
            },
            path: ['M', box.x, box.top - offset, 'L', box.right, box.top - offset]
        });

        hint.push({
            type: 'down',
            node: node,
            area: {
                x: box.x,
                y: box.bottom + offset,
                width: box.width,
                height: node.getStyle('margin-bottom')
            },
            path: ['M', box.x, box.bottom + offset, 'L', box.right, box.bottom + offset]
        });
        return hint;
    }
}));

KityMinder.registerConnectProvider('filetree', function(node, parent, connection) {
    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();
    var pathData = [];
    var left = pBox.left + 5;
    pathData.push('M', new kity.Point(left, pBox.bottom));
    pathData.push('L', new kity.Point(left, box.cy));
    pathData.push('L', new kity.Point(box.left, box.cy));
    connection.setPathData(pathData);
});