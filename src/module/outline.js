/* global Renderer: true */

KityMinder.registerModule('OutlineModule', function() {
    return {
        renderers: {
            outline: kity.createClass('OutlineRenderer', {
                base: Renderer,

                create: function(node) {
                    var outline = this.outline = new kity.Rect().setId(KityMinder.uuid('node_outline'));
                    node.getRenderContainer().prependShape(outline);
                },

                update: function(node) {
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
                    return outlineBox;
                }
            })
        }
    };
});