/**
 * @fileOverview
 *
 * 
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

/* global Layout: true */
KityMinder.registerLayout('fish-bone-slave', kity.createClass('FishBoneSlaveLayout', {
    base: Layout,

    doLayout: function (parent, children, round) {

        var layout = this;
        var abs = Math.abs;
        var GOLD_CUT = 1 - 0.618;

        var pBox = parent.getContentBox();
        var vi = parent.getLayoutVectorIn();

        parent.setLayoutVectorOut(vi);

        var goldX = pBox.left + pBox.width * GOLD_CUT;
        var pout = new kity.Point(goldX, vi.y > 0 ? pBox.bottom : pBox.top);
        parent.setVertexOut(pout);

        var child = children[0];
        if (!child) return;

        var cBox = child.getContentBox();

        children.forEach(function(child, index) {
            child.setLayoutTransform(new kity.Matrix());
            child.setLayoutVectorIn(new kity.Vector(1, 0));
            child.setVertexIn(new kity.Point(cBox.left, cBox.cy));
        });

        this.stack(children, 'y');
        this.align(children, 'left');
        var xAdjust = 0, yAdjust = 0;
        
        xAdjust += pout.x;

        if (parent.getLayoutVectorOut().y < 0) {
            yAdjust -= this.getTreeBox(children).bottom;
            yAdjust += parent.getContentBox().top;
            yAdjust -= parent.getStyle('margin-top');
            yAdjust -= child.getStyle('margin-bottom');
        } else {
            yAdjust += parent.getContentBox().bottom;
            yAdjust += parent.getStyle('margin-bottom');
            yAdjust += child.getStyle('margin-top');
        }

        this.move(children, xAdjust, yAdjust);

        if (round == 2) {
            children.forEach(function(child) {
                var m = child.getLayoutTransform();
                var cbox = child.getContentBox();
                var pin = m.transformPoint(new kity.Point(cbox.left, 0));
                layout.move([child], abs(pin.y - pout.y), 0);
            });
        }
    }
}));