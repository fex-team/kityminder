/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('bottom', kity.createClass({
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
                totalTreeWidth += box.width;
                if (index > 0) {
                    totalTreeWidth += children[index - 1].getStyle('margin-left');
                    totalTreeWidth += node.getStyle('margin-right');
                }
                return box;
            });
            var nodeContentBox = node.getContentBox();
            node.setLayoutVector(new kity.Vector(nodeContentBox.cx, nodeContentBox.bottom));
            var i, x, y, child, childTreeBox, childContentBox;
            var transform = new kity.Matrix();

            x = -totalTreeWidth / 2;

            for (i = 0; i < children.length; i++) {
                child = children[i];
                childTreeBox = childTreeBoxes[i];
                childContentBox = child.getContentBox();
                if (!childContentBox.width) continue;
                //水平方向上的布局
                x += childTreeBox.width / 2;
                if (i > 0) {
                    x += children[i].getStyle('margin-left');
                }
                y = nodeContentBox.bottom - childContentBox.top + node.getStyle('margin-bottom') + child.getStyle('margin-top');
                children[i].setLayoutTransform(new kity.Matrix().translate(x, y));
                x += childTreeBox.width / 2 + children[i].getStyle('margin-right');
            }

            if (node.isRoot()) {
                var branchBox = this.getBranchBox(children);
                var dx = branchBox.cx - nodeContentBox.cx;

                children.forEach(function(child) {
                    child.getLayoutTransform().translate(-dx, 0);
                });
            }
        }
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
    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();
    var pathData = [];
    pathData.push('M', new kity.Point(pBox.cx, pBox.bottom));
    pathData.push('L', new kity.Point(pBox.cx, pBox.bottom + parent.getStyle('margin-bottom')));
    pathData.push('L', new kity.Point(box.cx, pBox.bottom + parent.getStyle('margin-bottom')));
    pathData.push('L', new kity.Point(box.cx, box.top));
    connection.setMarker(null);
    connection.setPathData(pathData);
});