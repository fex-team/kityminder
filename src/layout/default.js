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

                child.setLayoutVector(new kity.Vector(childContentBox.right, childContentBox.cy));
            } else {
                x = nodeContentBox.left - childContentBox.right;
                x -= parent.getStyle('margin-left') + child.getStyle('margin-right');

                child.setLayoutVector(new kity.Vector(childContentBox.left, childContentBox.cy));
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

var connectMarker = new kity.Marker().pipe(function() {
    var r = 4;
    var dot = new kity.Circle(r).fill('white');
    this.addShape(dot);
    this.setRef(r, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
});

KityMinder.registerConnectProvider('default', function(node, parent, connection) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();

    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = box.cx > pBox.cx ? 'right' : 'left';

    node.getMinder().getPaper().addResource(connectMarker);

    switch (node.getType()) {

        case 'main':

            start = new kity.Point(pBox.cx, pBox.cy);
            end = side == 'left' ?
                new kity.Point(box.right + 2, box.cy) :
                new kity.Point(box.left - 2, box.cy);

            vector = kity.Vector.fromPoints(start, end);
            pathData.push('M', start);
            pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);

            connection.setMarker(connectMarker);

            break;

        case 'sub':

            var radius = node.getStyle('connect-radius');

            if (side == 'right') {
                start = new kity.Point(box.left - node.getStyle('margin-left') / 2, pBox.cy);
                end = new kity.Point(box.right + node.getStyle('margin-right'), box.bottom);
            } else {
                start = new kity.Point(box.right + node.getStyle('margin-right') / 2, pBox.cy);
                end = new kity.Point(box.left - node.getStyle('margin-left'), box.bottom);
            }

            end.y += 3;

            var isTop = parent.children.length > 1 && node.getIndex() === 0;

            pathData.push('M', start);
            pathData.push('L', start.x, isTop ? (end.y + radius) : (end.y - radius));

            var sf = +(side == 'right' && isTop || side == 'left' && !isTop);
            var ex = side == 'right' ? (start.x + radius) : (start.x - radius);

            pathData.push('A', radius, radius, 0, 0, sf, ex, end.y);
            pathData.push('L', end);

            connection.setMarker(null);

            break;
    }

    connection.setPathData(pathData);
});