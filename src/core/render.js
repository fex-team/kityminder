var Renderer = KityMinder.Renderer = kity.createClass('Renderer', {
    constructor: function(node) {
        this.node = node;
    },

    create: function(node) {
        throw new Error('Not implement: Renderer.create()');
    },

    shouldRender: function(node) {
        return true;
    },

    watchChange: function(data) {
        var changed;

        if (this.watchingData === undefined) {
            changed = true;
        } else if (this.watchingData != data) {
            changed = true;
        } else {
            changed = false;
        }

        this.watchingData = data;
    },

    shouldDraw: function(node) {
        return true;
    },

    update: function(shape, node, box) {
        if (this.shouldDraw()) this.draw(shape, node);
        return this.place(shape, node, box);
    },

    draw: function(shape, node) {
        throw new Error('Not implement: Renderer.draw()');
    },

    place: function(shape, node, box) {
        throw new Error('Not implement: Renderer.place()');
    },

    getRenderShape: function() {
        return this._renderShape || null;
    },

    setRenderShape: function(shape) {
        this._renderShape = shape;
    }
});

kity.extendClass(Minder, (function() {

    function createRendererForNode(node, registered) {
        var renderers = [];

        ['center', 'left', 'right', 'top', 'bottom', 'outline', 'outside'].forEach(function(section) {
            var before = 'before' + section;
            var after = 'after' + section;

            if (registered[before]) {
                renderers = renderers.concat(registered[before]);
            }
            if (registered[section]) {
                renderers = renderers.concat(registered[section]);
            }
            if (registered[after]) {
                renderers = renderers.concat(registered[after]);
            }
        });

        node._renderers = renderers.map(function(Renderer) {
            return new Renderer(node);
        });
    }

    return {

        renderNodeBatch: function(nodes) {
            var rendererClasses = this._rendererClasses;
            var lastBoxes = [];
            var rendererCount = 0;
            var i, j, renderer, node;

            if (!nodes.length) return;

            for (j = 0; j < nodes.length; j++) {
                node = nodes[j];
                if (!node._renderers) {
                    createRendererForNode(node, rendererClasses);
                }
                node._contentBox = new kity.Box();
                this.fire('beforerender', {
                    node: node
                });
            }

            // 所有节点渲染器数量是一致的
            rendererCount = nodes[0]._renderers.length;

            for (i = 0; i < rendererCount; i++) {

                // 获取延迟盒子数据
                for (j = 0; j < nodes.length; j++) {
                    if (typeof(lastBoxes[j]) == 'function') {
                        lastBoxes[j] = lastBoxes[j]();
                    }
                    if (!(lastBoxes[j] instanceof kity.Box)) {
                        lastBoxes[j] = new kity.Box(lastBoxes[j]);
                    }
                }

                for (j = 0; j < nodes.length; j++) {
                    node = nodes[j];
                    renderer = node._renderers[i];

                    // 合并盒子
                    if (lastBoxes[j]) {
                        node._contentBox = node._contentBox.merge(lastBoxes[j]);
                    }

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
                        lastBoxes[j] = renderer.update(renderer.getRenderShape(), node, node._contentBox);
                    }

                    // 如果不应该渲染，但是渲染图形创建过了，需要隐藏起来
                    else if (renderer.getRenderShape()) {
                        renderer.getRenderShape().setVisible(false);
                        lastBoxes[j] = null;
                    }
                }
            }

            for (j = 0; j < nodes.length; j++) {
                this.fire('noderender', {
                    node: nodes[j]
                });
            }
        },

        renderNode: function(node) {
            var rendererClasses = this._rendererClasses;
            var g = KityMinder.Geometry;
            var i, latestBox, renderer;

            if (!node._renderers) {
                createRendererForNode(node, rendererClasses);
            }

            this.fire('beforerender', {
                node: node
            });

            node._contentBox = new kity.Box();

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

                    if (typeof(latestBox) == 'function') latestBox = latestBox();

                    // 合并渲染区域
                    if (latestBox) {
                        node._contentBox = node._contentBox.merge(latestBox);
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
    };
})());

kity.extendClass(MinderNode, {
    render: function() {
        if (!this.attached) return;
        this.getMinder().renderNode(this);
        return this;
    },
    renderTree: function() {
        if (!this.attached) return;
        var list = [];
        this.traverse(function(node) {
            list.push(node);
        });
        this.getMinder().renderNodeBatch(list);
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
        //if (!this._contentBox) this.render();
        return this.parent && this.parent.isCollapsed() ? new kity.Box() : (this._contentBox || new kity.Box());
    }
});