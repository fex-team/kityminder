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

var marker = new kity.Marker();

marker.setWidth(10);
marker.setHeight(12);
marker.setRef(0, 0);
marker.setViewBox(-6, -4, 8, 10);

marker.addShape(new kity.Path().setPathData('M-5-3l5,3,-5,3').stroke('rgb(0, 220, 255)'));

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

        var vectorIn = this.vectorIn = new kity.Line()
            .stroke('rgb(0, 220, 255)');
        var vectorOut = this.vectorOut = new kity.Line()
            .stroke('rgb(0, 220, 255)');

        vectorIn.setMarker(marker, 'end');
        vectorOut.setMarker(marker, 'end');

        return wireframe.addShapes([oxy, box, vectorIn]);
    },

    shouldRender: function() {
        return wireframeOption;
    },

    update: function(created, node, box) {
        this.wireframe
            .setPosition(box.x, box.y)
            .setSize(box.width, box.height);
        var pin = node.getLayoutVectorIn().normalize(50);
        var pout = node.getLayoutVectorOut().normalize(50);
        this.vectorIn.setPoint1(-pin.x, -pin.y);
        this.vectorOut.setPoint2(pout.x, pout.y);
    }
});

KityMinder.registerModule('OutlineModule', function() {
    return {
        events: (!wireframeOption ? null : {
            'ready': function() {
                this.getPaper().addResource(marker);
            },
            'layoutallfinish': function() {
                this.getRoot().traverse(function(node) {
                    node.getRenderer('WireframeRenderer').update(null, node, node.getContentBox());
                });
            }
        }),
        renderers: {
            outline: OutlineRenderer,
            outside: [ShadowRenderer, WireframeRenderer]
        }
    };
});