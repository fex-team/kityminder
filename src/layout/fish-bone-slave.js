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

        var pBox = parent.getContentBox();
        parent.setLayoutVectorOut(parent.getLayoutVectorIn());

        var child = children[0];
        if (!child) return;

        children.forEach(function(child, index) {
            child.setLayoutTransform(new kity.Matrix());
            child.setLayoutVectorIn(parent.getLayoutVectorOut());
        });

        this.stack(children, 'y');
        this.align(children, 'left');

        var cBox = child.getContentBox();
        var xAdjust = 0, yAdjust = 0;
        
        xAdjust += cBox.left;

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
                var m = child.getLayoutTransform().getMatrix();
                layout.move([child], abs(m.f), 0);
            });
        }
    }
}));