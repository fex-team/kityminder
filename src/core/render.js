var Renderer = kity.createClass('Renderer', {
    create: function(node) {
        throw new Error('Not implement: Renderer.create()');
    },

    update: function(node) {
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

        node._renderers = renderers.map(function(Renderer) {
            var renderer = new Renderer();
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
            latestBox = node._renderers[i].update(node);
            if (latestBox) {
                node._contentBox = contentBox = g.mergeBox(contentBox, latestBox);
            }
        }
    }
});

kity.extendClass(MinderNode, {
    render: function() {
        this.getMinder().renderNode(this);
        return this;
    },
    getContentBox: function() {
        return this._contentBox;
    }
});