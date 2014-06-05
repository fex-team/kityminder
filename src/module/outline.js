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
                    this.outline
                        .setPosition(
                            contentBox.x - paddingLeft,
                            contentBox.y - paddingTop)
                        .setSize(
                            contentBox.width + paddingLeft + paddingRight,
                            contentBox.height + paddingTop + paddingBottom)
                        .setRadius(node.getStyle('radius'))
                        .fill(node.isSelected() ?
                            node.getStyle('selected-background') :
                            node.getStyle('background'));
                }
            })
        }
    };
});