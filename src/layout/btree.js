/* global Layout:true */

var layouts = ['left', 'right', 'top', 'bottom'];

layouts.forEach(function(name) {

    var axis = (name == 'left' || name == 'right') ? 'x' : 'y';
    var dir = (name == 'left' || name == 'top') ? -1 : 1;

    var oppsite = {
        'left': 'right',
        'right': 'left',
        'top': 'bottom',
        'bottom': 'top',
        'x': 'y',
        'y': 'x'
    };

    function getOrderHint(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = 5;

        if (axis == 'x') {
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
        } else {
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
        }
        return hint;
    }

    KityMinder.registerLayout(name, kity.createClass({

        base: Layout,

        doLayout: function(parent, children) {

            if (!children.length) {
                return false;
            }

            var pbox = parent.getContentBox();

            if (axis == 'x') {
                parent.setVertexOut(new kity.Point(pbox[name], pbox.cy));
                parent.setLayoutVectorOut(new kity.Vector(dir, 0));
            } else {
                parent.setVertexOut(new kity.Point(pbox.cx, pbox[name]));
                parent.setLayoutVectorOut(new kity.Vector(0, dir));
            }

            children.forEach(function(child) {
                var cbox = child.getContentBox();
                child.setLayoutTransform(new kity.Matrix());

                if (axis == 'x') {
                    child.setVertexIn(new kity.Point(cbox[oppsite[name]], cbox.cy));
                    child.setLayoutVectorIn(new kity.Vector(dir, 0));
                } else {
                    child.setVertexIn(new kity.Point(cbox.cx, cbox[oppsite[name]]));
                    child.setLayoutVectorIn(new kity.Vector(0, dir));
                }
            });

            this.align(children, oppsite[name]);
            this.stack(children, oppsite[axis]);

            var bbox = this.getBranchBox(children);
            var xAdjust, yAdjust;

            if (axis == 'x') {
                xAdjust = pbox[name];
                xAdjust += dir * parent.getStyle('margin-' + name);
                xAdjust += dir * children[0].getStyle('margin-' + oppsite[name]);

                yAdjust = pbox.bottom;
                yAdjust -= pbox.height / 2;
                yAdjust -= bbox.height / 2;
                yAdjust -= bbox.y;
            } else {
                xAdjust = pbox.right;
                xAdjust -= pbox.width / 2;
                xAdjust -= bbox.width / 2;
                xAdjust -= bbox.x;

                yAdjust = pbox[name];
                yAdjust += dir * parent.getStyle('margin-' + name);
                yAdjust += dir * children[0].getStyle('margin-' + oppsite[name]);
            }

            this.move(children, xAdjust, yAdjust);
        },

        getOrderHint: getOrderHint
    }));
});