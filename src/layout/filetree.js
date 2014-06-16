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
                child.setLayoutVector(new kity.Vector(childContentBox.left + 5, childContentBox.cy));
            }
        }
    }
}));

KityMinder.registerConnectProvider('filetree', function(node, parent) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();
    var abs = Math.abs;
    var pathData = [];
    var side = box.cx > pBox.cx ? 'right' : 'left';
    var left = pBox.left + 5;
    pathData.push('M', new kity.Point(left, pBox.bottom));
    pathData.push('L', new kity.Point(left, box.cy));
    pathData.push('L', new kity.Point(box.left, box.cy));
    return pathData;
});