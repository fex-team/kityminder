/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('left', kity.createClass({

    base: Layout,

    doLayout: function(node) {
        var children = node.getChildren();

        if (!children.length) {
            return false;
        }

        var nbox = node.getContentBox();

        node.setVertexOut(new kity.Point(nbox.left, nbox.cy));
        node.setLayoutVector(new kity.Vector(-1, 0));

        children.forEach(function(child) {
            var cbox = child.getContentBox();
            child.setLayoutTransform(new kity.Matrix());

            child.setVertexIn(new kity.Point(cbox.right, cbox.cy));
        });

        this.align(children, 'right');
        this.stack(children, 'y');

        var bbox = this.getBranchBox(children);
        var xAdjuxt = nbox.left - node.getStyle('margin-left') - children[0].getStyle('margin-right');
        var yAdjust = nbox.height / 2 + nbox.top - bbox.height / 2;


        this.move(children, 0, yAdjust);

    },

    getOrderHint: function(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = 5;

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

// KityMinder.registerConnectProvider('bottom', function(node, parent, connection) {
//     var pout = parent.getLayoutVertexOut(),
//         pin = node.getLayoutVertexIn();
//     var pathData = [];
//     var r = Math.round;
//     pathData.push('M', new kity.Point(r(pout.x), pout.y));
//     pathData.push('L', new kity.Point(r(pout.x), pout.y + parent.getStyle('margin-bottom')));
//     pathData.push('L', new kity.Point(r(pin.x), pout.y + parent.getStyle('margin-bottom')));
//     pathData.push('L', new kity.Point(r(pin.x), pin.y));
//     connection.setMarker(null);
//     connection.setPathData(pathData);
// });