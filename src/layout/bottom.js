/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('bottom', kity.createClass({

    base: Layout,

    doLayout: function(node) {
        var children = node.getChildren();

        if (!children.length) {
            return false;
        }

        var nbox = node.getContentBox();

        node.setVertexOut(new kity.Point(nbox.cx, nbox.bottom));
        node.setLayoutVector(new kity.Vector(0, 1));

        children.forEach(function(child) {
            var cbox = child.getContentBox();
            child.setLayoutTransform(new kity.Matrix());

            child.setVertexIn(new kity.Point(cbox.cx, cbox.top));
        });

        var yDistance = nbox.bottom + node.getStyle('margin-bottom') + children[0].getStyle('margin-top');

        this.align(children, 'top', yDistance);

        this.stack(children, 'x');

        var bbox = this.getBranchBox(children);

        this.move(children, nbox.width / 2 + nbox.left - bbox.width / 2, 0);

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