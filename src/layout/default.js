/* global Layout:true */

KityMinder.registerLayout('default', kity.createClass({
    base: Layout,

    getSide: function(node) {
        while (!node.parent.isLayoutRoot()) {
            node = node.parent;
        }
        var mainIndex = node.getIndex();
        return {
            0: 'right',
            1: 'right',
            2: 'left',
            3: 'left'
        }[mainIndex] || (mainIndex % 2 ? 'right' : 'left');
    },

    doLayout: function(node) {
        var layout = this;

        function arrange(node, children, side) {
            //if (!children.length) return;

            var height = 0;

            var childBoxes = children.map(function(node, index, children) {
                var box = layout.getTreeBox([node]);
                height += box.height;
                if (index > 0) {
                    height += children[index - 1].getStyle('margin-bottom');
                    height += node.getStyle('margin-top');
                }
                return box;
            });

            var contentBox = node.getContentBox();
            var x, y = -height / 2;

            for (var i = 0; i < children.length; i++) {

                if (side == 'right') {
                    x = contentBox.x + contentBox.width - children[i].getContentBox().x;
                    x += node.getStyle('margin-right') + node.children[i].getStyle('margin-left');
                } else {
                    x = contentBox.x - children[i].getContentBox().width - children[i].getContentBox().x;
                    x -= node.getStyle('margin-left') + node.children[i].getStyle('margin-right');
                }

                y += childBoxes[i].height / 2;

                if (i > 0) {
                    y += children[i].getStyle('margin-top');
                }

                children[i].setLayoutTransform(new kity.Matrix().translate(x, y));

                y += childBoxes[i].height / 2 + children[i].getStyle('margin-bottom');
            }

            var branchBox = layout.getBranchBox(children);
            var dy = (branchBox.y + branchBox.height / 2) - (contentBox.y + contentBox.height / 2);

            for (i = 0; i < children.length; i++) {
                children[i].getLayoutTransform().translate(0, -dy);
            }

        }

        function layoutRoot(node) {
            var mains = node.getChildren();
            var group = {
                left: [],
                right: []
            };

            mains.forEach(function(main) {
                group[layout.getSide(main)].push(main);
            });

            arrange(node, group.left, 'left');
            arrange(node, group.right, 'right');
        }

        if (node.isLayoutRoot()) {
            layoutRoot(node);
        } else {
            arrange(node, node.children, layout.getSide(node));
        }
    }
}));