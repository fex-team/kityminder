/* global Renderer: true */


var OutlineRenderer = kity.createClass('OutlineRenderer', {
    base: Renderer,

    create: function(node) {

        var outline = new kity.Rect()
            .setId(KityMinder.uuid('node_outline'));

        this.bringToBack = true;

        return outline;
    },

    update: function(outline, node, box) {

        var paddingLeft = node.getStyle('padding-left'),
            paddingRight = node.getStyle('padding-right'),
            paddingTop = node.getStyle('padding-top'),
            paddingBottom = node.getStyle('padding-bottom');

        var outlineBox = {
            x: box.x - paddingLeft,
            y: box.y - paddingTop,
            width: box.width + paddingLeft + paddingRight,
            height: box.height + paddingTop + paddingBottom
        };

        var prefix = node.isSelected() ? 'selected-' : '';

        outline
            .setPosition(outlineBox.x, outlineBox.y)
            .setSize(outlineBox.width, outlineBox.height)
            .setRadius(node.getStyle('radius'))
            .fill(node.getData('background') || node.getStyle(prefix + 'background') || node.getStyle('background'))
            .stroke(node.getStyle(prefix + 'stroke' || node.getStyle('stroke')),
                node.getStyle(prefix + 'stroke-width'));

        return new kity.Box(outlineBox);
    }
});

var ShadowRenderer = kity.createClass('ShadowRenderer', {
    base: Renderer,

    create: function(node) {
        this.bringToBack = true;
        return new kity.Rect();
    },

    shouldRender: function(node) {
        return node.getStyle('shadow');
    },

    update: function(shadow, node, box) {
        shadow.setPosition(box.x + 4, box.y + 5)
            .setSize(box.width, box.height)
            .fill(node.getStyle('shadow'))
            .setRadius(node.getStyle('radius'));
    }
});

var wireframeOption = /wire/.test(window.location.href);
var WireframeRenderer = kity.createClass('WireframeRenderer', {
    base: Renderer,

    create: function() {
        var wireframe = new kity.Group();
        var oxy = this.oxy = new kity.Path()
            .stroke('#f6f')
            .setPathData('M0,-50L0,50M-50,0L50,0');

        var box = this.wireframe = new kity.Rect()
            .stroke('lightgreen');

        return wireframe.addShapes([oxy, box]);
    },

    shouldRender: function() {
        return wireframeOption;
    },

    update: function(created, node, box) {
        this.wireframe
            .setPosition(box.x, box.y)
            .setSize(box.width, box.height);
    }
});

KityMinder.registerModule('OutlineModule', function() {
    return {
        renderers: {
            outline: OutlineRenderer,
            outside: [ShadowRenderer, WireframeRenderer]
        }
    };
});