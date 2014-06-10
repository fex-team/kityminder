var Renderer = KityMinder.Renderer = kity.createClass('Renderer', {
    constructor: function(node) {
        this.node = node;
    },

    create: function() {
        throw new Error('Not implement: Renderer.create()');
    },

    update: function() {
        throw new Error('Not implement: Renderer.update()');
    }
});

kity.extendClass(MinderNode, {
    getContentBox: function() {
        return this._contentBox;
    }
});

kity.extendClass(Minder, {

    _createRendererForNode: function(node) {
        var registered = this._renderers;
        var renderers = [];
        renderers = renderers.concat(registered.center);
        renderers = renderers.concat(registered.left);
        renderers = renderers.concat(registered.right);
        renderers = renderers.concat(registered.top);
        renderers = renderers.concat(registered.bottom);
        renderers = renderers.concat(registered.outline);
        renderers = renderers.concat(registered.outside);

        node._renderers = renderers.map(function(Renderer) {
            var renderer = new Renderer(node);
            renderer.create(node);
            return renderer;
        });
    },

    renderNode: function(node) {
        var rendererClasses = this._renderers,
            g = KityMinder.Geometry,
            contentBox = node._contentBox = g.wrapBox({
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            });
        var i, latestBox;

        if (!node._renderers) {
            this._createRendererForNode(node);
        }

        for (i = 0; i < node._renderers.length; i++) {
            latestBox = node._renderers[i].update(node, contentBox);
            if (latestBox) {
                node._contentBox = contentBox = g.mergeBox(contentBox, latestBox);
            }
        }

        this.fire('noderender', {
            node: node
        });
    }
});

kity.extendClass(MinderNode, {
    render: function() {
        this.getMinder().renderNode(this);
        return this;
    },
    getRenderer: function(type) {
        var rs = this._renderers;
        for (var i = 0; i < rs.length; i++) {
            if (rs[i] instanceof type) return rs[i];
        }
        return null;
    },
    getContentBox: function() {
        return this.parent && this.parent.isCollapsed() ? {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            cx: 0,
            cy: 0
        } : this._contentBox;
    }
});