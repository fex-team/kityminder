/* global Renderer: true */

var wireframe = /wire/.test(window.location.href);

KityMinder.registerModule('OutlineModule', function() {
    return {
        renderers: {
            outline: kity.createClass('OutlineRenderer', {
                base: Renderer,

                create: function(node) {
                    var group = new kity.Group();

                    var outline = this.outline = new kity.Rect()
                        .setId(KityMinder.uuid('node_outline'));

                    var shadow = this.shadow = new kity.Rect()
                        .setId(KityMinder.uuid('node_shadow'))
                        .fill('black')
                        .setOpacity(0.2);

                    group.addShapes([shadow, outline]);

                    if (wireframe) {
                        var oxy = this.oxy = new kity.Path()
                            .stroke('#f6f')
                            .setPathData('M0,-50L0,50M-50,0L50,0');

                        var box = this.wireframe = new kity.Rect()
                            .stroke('lightgreen');

                        group.addShapes([oxy, box]);
                    }

                    this.bringToBack = true;
                    return group;
                },

                update: function(created, node) {
                    var contentBox = node.getContentBox();

                    var paddingLeft = node.getStyle('padding-left'),
                        paddingRight = node.getStyle('padding-right'),
                        paddingTop = node.getStyle('padding-top'),
                        paddingBottom = node.getStyle('padding-bottom');

                    var outlineBox = {
                        x: contentBox.x - paddingLeft,
                        y: contentBox.y - paddingTop,
                        width: contentBox.width + paddingLeft + paddingRight,
                        height: contentBox.height + paddingTop + paddingBottom
                    };

                    this.outline
                        .setPosition(outlineBox.x, outlineBox.y)
                        .setSize(outlineBox.width, outlineBox.height)
                        .setRadius(node.getStyle('radius'))
                        .fill(node.isSelected() ?
                            node.getStyle('selected-background') :
                            node.getStyle('background'));

                    if (node.getLevel() < 2) {
                        this.shadow
                            .setVisible(true)
                            .setPosition(outlineBox.x + 3, outlineBox.y + 4)
                            .setSize(outlineBox.width, outlineBox.height)
                            .setRadius(node.getStyle('radius'));
                    } else {
                        this.shadow.setVisible(false);
                    }

                    if (wireframe) {
                        this.wireframe
                            .setPosition(outlineBox.x, outlineBox.y)
                            .setSize(outlineBox.width, outlineBox.height);
                    }
                    return outlineBox;
                }
            })
        }
    };
});