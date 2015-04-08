/**
 * @fileOverview
 *
 * 天盘模板
 *
 * @author: along
 * @copyright: bpd729@163.com, 2015
 */
KityMinder.registerLayout('tianpan', kity.createClass({
    base: Layout,

    doLayout: function (parent, children) {
        if (children.length == 0) return;

        var layout = this;
        var pbox = parent.getContentBox();

        var x, y,box;
        var _theta = 5;
        var _r = Math.max(pbox.width, 50);
        children.forEach(function (child, index) {
            child.setLayoutTransform(new kity.Matrix());
            box = layout.getTreeBox(child);
            _r = Math.max(Math.max(box.width, box.height), _r);
        })
        _r = _r / 1.5 / Math.PI;

        children.forEach(function (child, index) {
            x = _r * (Math.cos(_theta) + Math.sin(_theta) * _theta);
            y = _r * (Math.sin(_theta) - Math.cos(_theta) * _theta);

            _theta += (0.9 - index * 0.02);
            child.setLayoutVectorIn(new kity.Vector(1, 0));
            child.setVertexIn(new kity.Point(pbox.cx, pbox.cy));
            child.setLayoutTransform(new kity.Matrix());
            layout.move([child], x, y);
        });
    },

    getOrderHint: function (node) {
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