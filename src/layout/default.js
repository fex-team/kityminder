/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('default', kity.createClass({
    base: Layout,

    doLayout: function(node) {
        var layout = this;

        if (node.isLayoutRoot()) {
            this.doLayoutRoot(node);
        } else {
            this.arrange(node, node.children, layout.getSide(node));
        }
    },

    getSide: function(node) {
        while (!node.parent.isLayoutRoot()) {
            node = node.parent;
        }
        var mainIndex = node.getIndex();
        var length = node.parent.children.length;
        return mainIndex < length / 2 ? 'right' : 'left';
    },

    doLayoutRoot: function(root) {
        var mains = root.getChildren();
        var group = {
            left: [],
            right: []
        };
        var _this = this;

        mains.forEach(function(main) {
            group[_this.getSide(main)].push(main);
        });

        this.arrange(root, group.left, 'left');
        this.arrange(root, group.right, 'right');
    },

    arrange: function(parent, children, side) {
        if (!children.length) return;
        var _this = this;

        // children 所占的总树高
        var totalTreeHeight = 0;

        // 计算每个 child 的树所占的矩形区域
        var childTreeBoxes = children.map(function(node, index, children) {
            var box = _this.getTreeBox([node]);

            // 计算总树高，需要把竖直方向上的 margin 加入计算
            totalTreeHeight += box.height;

            if (index > 0) {
                totalTreeHeight += children[index - 1].getStyle('margin-bottom');
                totalTreeHeight += node.getStyle('margin-top');
            }

            return box;
        });

        var nodeContentBox = parent.getContentBox();
        var i, x, y, child, childTreeBox, childContentBox;
        var transform = new kity.Matrix();

        y = -totalTreeHeight / 2;

        for (i = 0; i < children.length; i++) {
            child = children[i];
            childTreeBox = childTreeBoxes[i];
            childContentBox = child.getContentBox();

            if (!childContentBox.height) continue;

            // 水平方向上的布局
            if (side == 'right') {
                x = nodeContentBox.right - childContentBox.left;
                x += parent.getStyle('margin-right') + child.getStyle('margin-left');
            } else {
                x = nodeContentBox.left - childContentBox.right;
                x -= parent.getStyle('margin-left') + child.getStyle('margin-right');
            }

            // 竖直方向上的布局
            y += childTreeBox.height / 2;

            if (i > 0) {
                y += children[i].getStyle('margin-top');
            }

            children[i].setLayoutTransform(new kity.Matrix().translate(x, y));

            y += childTreeBox.height / 2 + children[i].getStyle('margin-bottom');
        }

        if (parent.isRoot()) {
            var branchBox = this.getBranchBox(children);
            var dy = branchBox.cy - nodeContentBox.cy;

            children.forEach(function(child) {
                child.getLayoutTransform().translate(0, -dy);
            });
        }
    }
}));