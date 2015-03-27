/**
 * Created with JetBrains WebStorm.
 * User: chenbaolong
 * Date: 15-3-20
 * Time: 上午11:04
 * To change this template use File | Settings | File Templates.
 */
/* global Layout:true */
KityMinder.registerLayout('tianpan', kity.createClass({
    base: Layout,

    doLayout: function(node, children) {
        var child = children[0];
        if (!child) return;

        //console.log(node)
        var layout = this;
        var pbox = node.getContentBox();

        var x,y;
        var _theta = 5;
        var _r = pbox.width / Math.PI /1.5;

        console.log('a')
        children.forEach(function(child, index) {
            x = (_r) * (Math.cos(_theta) + Math.sin(_theta) * _theta);
            y = (_r) * (Math.sin(_theta) - Math.cos(_theta) * _theta);

            child.setLayoutTransform(new kity.Matrix());
           // child.setLayoutVectorIn(
           // new kity.Vector(1, 0));
           // child.setVertexIn(new kity.Point(cBox.left, cBox.cy));

            child.getLayoutTransform().translate(x, y);
            _theta += 0.9;//+(-index*0.02);
        });
        return;


        children.forEach(function(child) {
            x = (_r) * (Math.cos(_theta) + Math.sin(_theta) * _theta);
            y = (_r) * (Math.sin(_theta) - Math.cos(_theta) * _theta);


            var m = child.getLayoutTransform();
            var cbox = child.getContentBox();
            var pin = m.transformPoint(new kity.Point(cbox.left, 0));
            layout.move([child],  pbox.left,  pbox.right);

            //layout.move([child], x, y);

          // child.getLayoutTransform().translate(110, 100);
           // child.setLayoutTransform(new kity.Matrix());
        });


        return null;

        //debugger
        var layout = this;
        var half = Math.ceil(node.children.length / 2);
        var right = [];
        var left = [];

        children.forEach(function(child) {
            if (child.getIndex() < half) right.push(child);
            else left.push(child);
        });

        var leftLayout = KityMinder.getLayoutInstance('left');
        var rightLayout = KityMinder.getLayoutInstance('right');

        leftLayout.doLayout(node, left);
        rightLayout.doLayout(node, right);

        var box = node.getContentBox();
        node.setVertexOut(new kity.Point(box.cx, box.cy));
        node.setLayoutVectorOut(new kity.Vector(0, 0));
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