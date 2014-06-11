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
            var i, x, y, child, childTreeBox, childContentBox;
            var transform = new kity.Matrix();
            x = -totalTreeWidth / 2;

            for (var i = 0; i < children.length; i++) {
                child = children[i];
                childTreeBox = childTreeBoxes[i];
                childContentBox = child.getContentBox();
                if (!childContentBox.width) continue;
                //水平方向上的布局
                x += childTreeBox.width / 2;
                if (i > 1) {
                    x += children[i].getStyle('margin-left');
                }
                y = nodeContentBox.height + node.getStyle('margin-bottom') + children[i].getStyle('margin-top');
                children[i].setLayoutTransform(new kity.Matrix().translate(x, y));
                x += childTreeBox.width / 2 + children[i].getStyle('margin-right');
            }
        }
    }
}));