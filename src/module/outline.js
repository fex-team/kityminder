/* global Renderer: true */

var wireframe = /wire/.test(window.location.href);

var OutlineRenderer = kity.createClass('OutlineRenderer', {
    base: Renderer,

    create: function(node) {
        var group = new kity.Group();

        var outline = this.outline = new kity.Rect()
            .setId(KityMinder.uuid('node_outline'));

        var shadow = this.shadow = new kity.Rect()
            .setId(KityMinder.uuid('node_shadow'));

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
            .setRadius(node.getStyle('radius'));

        var prefix = node.isSelected() ? 'selected-' : '';

        this.outline.fill(node.getStyle(prefix + 'background'));
        this.outline.stroke(node.getStyle(prefix + 'stroke'),
            node.getStyle(prefix + 'stroke-width'));

        if (node.getStyle('shadow')) {
            this.shadow
                .setVisible(true)
                .setPosition(outlineBox.x + 4, outlineBox.y + 5)
                .setSize(outlineBox.width, outlineBox.height)
                .fill(node.getStyle('shadow'))
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
});

KityMinder.registerModule('OutlineModule', function() {
    return {
        renderers: {
            outline: OutlineRenderer
        }
    };
});