var Renderer = KityMinder.Renderer = kity.createClass('Renderer', {
    constructor: function(node) {
        this.node = node;
    },

    create: function() {
        throw new Error('Not implement: Renderer.create()');
    },

    shouldRender: function() {
        return true;
    },

    update: function() {
        throw new Error('Not implement: Renderer.update()');
    },

    getRenderShape: function() {
        return this._renderShape || null;
    },

    setRenderShape: function(shape) {
        this._renderShape = shape;
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

        ['center', 'left', 'right', 'top', 'bottom', 'outline', 'outside'].forEach(function(section) {
            if (registered['before' + section]) {
                renderers = renderers.concat(registered['before' + section]);
            }
            if (registered[section]) {
                renderers = renderers.concat(registered[section]);
            }
            if (registered['after' + section]) {
                renderers = renderers.concat(registered['after' + section]);
            }
        });

        node._renderers = renderers.map(function(Renderer) {
            return new Renderer(node);
        });
    },

    renderNode: function(node) {
        var rendererClasses = this._renderers;
        var g = KityMinder.Geometry;
        var i, latestBox, renderer;

        if (!node._renderers) {
            this._createRendererForNode(node);
        }

        node._contentBox = g.wrapBox({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        });

        node._renderers.forEach(function(renderer) {

            // 判断当前上下文是否应该渲染
            if (renderer.shouldRender(node)) {

                // 应该渲染，但是渲染图形没创建过，需要创建
                if (!renderer.getRenderShape()) {
                    renderer.setRenderShape(renderer.create(node));
                    if (renderer.bringToBack) {
                        node.getRenderContainer().prependShape(renderer.getRenderShape());
                    } else {
                        node.getRenderContainer().appendShape(renderer.getRenderShape());
                    }
                }

                // 强制让渲染图形显示
                renderer.getRenderShape().setVisible(true);

                // 更新渲染图形
                latestBox = renderer.update(renderer.getRenderShape(), node, node._contentBox);

                // 合并渲染区域
                if (latestBox) {
                    node._contentBox = g.mergeBox(node._contentBox, latestBox);
                }
            }

            // 如果不应该渲染，但是渲染图形创建过了，需要隐藏起来
            else if (renderer.getRenderShape()) {
                renderer.getRenderShape().setVisible(false);
            }

        });

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
            if (rs[i].getType() == type) return rs[i];
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