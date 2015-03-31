/**
 * Created with JetBrains WebStorm.
 * User: chenbaolong
 * Date: 15-3-20
 * Time: 上午11:04
 * To change this template use File | Settings | File Templates.
 */
/* global Layout:true */


function aadsf(){



}


KityMinder.registerLayout('tianpan', kity.createClass({
    base: Layout,

    doLayout: function(parent, children) {
        console.log(parent);
        if(children.length==0) return;
        var layout = this;
        var pbox = parent.getContentBox();

        var x, y,alpha;

        var alpha = 10;
        var _theta =  5;
        var _r = Math.max(pbox.width,80) / 1.5 / Math.PI;

        var g = KityMinder.Geometry;
        var _tmp_rects=[],_tempchilds=[],_do = true, _cut_rect,_cover = false;
        _tmp_rects.push(pbox);

        children.forEach(function(child, index) {
//            x = _r * (Math.cos(alpha) + Math.sin(alpha)* alpha * Math.PI/180);
//            y = _r * (Math.sin(alpha) - Math.cos(alpha)* alpha * Math.PI/180);

           // while (_do) {
                x = _r * (Math.cos(_theta) + Math.sin(_theta) * _theta);
                y = _r * (Math.sin(_theta) - Math.cos(_theta) * _theta);
                _theta += (0.9 - index * 0.02);

                console.log(child.getContentBox());

                child.getContentBox().translate(x, y);
                console.log(child.getContentBox());
                debugger

//                _cut_rect = layout.getTreeBox(child);
//                _tmp_rects.forEach(function (tmpRect) {
//                    debugger
//                    if (g.getIntersectBox(tmpRect,_cut_rect)) {
//                        _cover = true;
//                    }
//                })
//
//                if (_cover) {
//                    _r += 2;
//                    console.log('true')
//                } else {
//                    _do = false;
//                    _tempchilds.push({child: child, r: _r, theta: _theta, area: _cut_rect})
//                    _theta += 0.9;
//                    _tmp_rects.push(_cut_rect);
//                }
          // }
        });


        console.log(_tmp_rects);
        return;
        //child.setLayoutTransform(new kity.Matrix());
        //child.getLayoutTransform().translate(x, y);

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