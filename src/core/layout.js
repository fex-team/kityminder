/**
 * 布局支持池子管理
 */
Utils.extend(KityMinder, {
    _layout: {},

    registerLayout: function(name, layout) {
        KityMinder._layout[name] = layout;
        if (!KityMinder._defaultLayout) {
            KityMinder._defaultLayout = name;
        }
    }
});

/**
 * MinderNode 上的布局支持
 */
kity.extendClass(MinderNode, {

    /**
     * 获得当前节点的布局名称
     *
     * @return {String}
     */
    getLayout: function() {
        var layout = this.getData('layout');

        layout = layout || (this.isRoot() ? KityMinder._defaultLayout : this.parent.getLayout());

        return layout;
    },

    getOrder: function() {
        return this.getData('order') || this.getIndex();
    },

    setOrder: function(order) {
        return this.setData('order', order);
    },

    getOrderHint: function(refer) {
        return this.parent.getLayoutInstance().getOrderHint(this);
    },

    getExpandPosition: function() {
        return this.getLayoutInstance().getExpandPosition();
    },

    getLayoutInstance: function() {
        var LayoutClass = KityMinder._layout[this.getLayout()];
        var layout = new LayoutClass();
        return layout;
    },

    /**
     * 设置当前节点相对于父节点的布局变换
     */
    setLayoutTransform: function(matrix) {
        this._layoutTransform = matrix;
    },

    /**
     * 获取当前节点相对于父节点的布局变换
     */
    getLayoutTransform: function() {
        return this._layoutTransform || new kity.Matrix();
    },

    /**
     * 设置当前节点相对于父节点的布局向量
     */
    setLayoutVector: function(vector) {
        this._layoutVector = vector;
        return this;
    },

    /**
     * 获取当前节点相对于父节点的布局向量
     */
    getLayoutVector: function(vector) {
        return this._layoutVector || new kity.Vector();
    },

    /**
     * 获取节点相对于全局的布局变换
     */
    getGlobalLayoutTransform: function() {
        return this._lastLayoutTransform || new kity.Matrix();
    },

    getLayoutBox: function() {
        var matrix = this.getGlobalLayoutTransform();
        return matrix.transformBox(this.getContentBox());
    },

    getLayoutPoint: function() {
        var matrix = this.getGlobalLayoutTransform();
        return matrix.transformPoint(new kity.Point());
    },

    getLayoutOffset: function() {
        var data = this.getData('layout_' + this.getLayout() + '_offset');
        if (data) return new kity.Point(data.x, data.y);
        return new kity.Point();
    },

    setLayoutOffset: function(p) {
        this.setData('layout_' + this.getLayout() + '_offset', p ? {
            x: p.x,
            y: p.y
        } : null);
        return this;
    },

    getLayoutRoot: function() {
        if (this.isLayoutRoot()) {
            return this;
        }
        return this.parent.getLayoutRoot();
    },

    isLayoutRoot: function() {
        return this.getData('layout') || this.isRoot();
    },

    layout: function(name, duration) {
        if (name) {
            if (name == 'inherit') {
                this.setData('layout');
            } else {
                this.setData('layout', name);
            }
        }

        this.getMinder().layout(duration);

        return this;
    }
});

kity.extendClass(Minder, {

    layout: function(duration) {

        this.getRoot().traverse(function(node) {
            node.setLayoutTransform(null);
        });

        function layoutNode(node) {

            // layout all children first
            // 剪枝：收起的节点无需计算
            if (node.isExpanded()) {
                node.children.forEach(function(child) {
                    layoutNode(child);
                });
            }

            var layout = node.getLayoutInstance();
            layout.doLayout(node);
        }

        layoutNode(this.getRoot());

        this.applyLayoutResult(this.getRoot(), duration);

        return this.fire('layout');
    },

    refresh: function(duration) {
        this.getRoot().preTraverse(function(node) { node.render(); });
        this.layout(duration).fire('contentchange').fire('interactchange');
        return this;
    },

    applyLayoutResult: function(root, duration) {
        root = root || this.getRoot();
        var me = this;

        function applyMatrix(node, matrix) {
            node.getRenderContainer().setMatrix(node._lastLayoutTransform = matrix);
            me.fire('layoutapply', {
                node: node,
                matrix: matrix
            });
        }

        function apply(node, pMatrix) {
            var matrix = node.getLayoutTransform().merge(pMatrix);
            var lastMatrix = node._lastLayoutTransform || new kity.Matrix();

            var offset = node.getLayoutOffset();
            matrix.translate(offset.x, offset.y);

            if (!matrix.equals(lastMatrix) || true) {

                // 如果当前有动画，停止动画
                if (node._layoutTimeline) {
                    node._layoutTimeline.stop();
                    delete node._layoutTimeline;
                }

                // 如果要求以动画形式来更新，创建动画
                if (duration > 0) {
                    node._layoutTimeline = new kity.Animator(lastMatrix, matrix, applyMatrix)
                        .start(node, duration, 'ease')
                        .on('finish', function() {
                            // 可能性能低的时候会丢帧
                            setTimeout(function() {
                                applyMatrix(node, matrix);
                                me.fire('layoutfinish', {
                                    node: node,
                                    matrix: matrix
                                });
                            });
                        });
                }

                // 否则直接更新
                else {
                    applyMatrix(node, matrix);
                    me.fire('layoutfinish', {
                        node: node,
                        matrix: matrix
                    });
                }
            }

            for (var i = 0; i < node.children.length; i++) {
                apply(node.children[i], matrix);
            }
        }

        apply(root, root.parent ? root.parent.getGlobalLayoutTransform() : new kity.Matrix());
        return this;
    },
});


/**
 * @class Layout 布局基类，具体布局需要从该类派生
 */
var Layout = kity.createClass('Layout', {

    /**
     * @abstract
     *
     * 子类需要实现的布局算法，该算法输入一个节点，排布该节点的子节点（相对父节点的变换）
     *
     * @param  {MinderNode} node 需要布局的节点
     *
     * @example
     *
     * doLayout: function(node) {
     *     var children = node.getChildren();
     *     // layout calculation
     *     children[i].setLayoutTransform(new kity.Matrix().translate(x, y));
     * }
     */
    doLayout: function(node) {
        throw new Error('Not Implement: Layout.doLayout()');
    },

    /**
     * 工具方法：获取给点的节点所占的布局区域
     *
     * @param  {MinderNode[]} nodes 需要计算的节点
     *
     * @return {Box} 计算结果
     */
    getBranchBox: function(nodes) {
        var box = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };
        var g = KityMinder.Geometry;
        var i, node, matrix, contentBox;
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            matrix = node.getLayoutTransform();
            contentBox = node.getContentBox();
            box = g.mergeBox(box, matrix.transformBox(contentBox));
        }

        return box;
    },

    /**
     * 工具方法：计算给点节点的子树所占的布局区域
     *
     * @param  {MinderNode} nodes 需要计算的节点
     *
     * @return {Box} 计算的结果
     */
    getTreeBox: function(nodes) {
        var box = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };
        var g = KityMinder.Geometry;
        var i, node, matrix, treeBox;
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            matrix = node.getLayoutTransform();

            treeBox = node.getContentBox();

            if (node.children.length) {
                treeBox = g.mergeBox(treeBox, this.getTreeBox(node.children));
            }

            box = g.mergeBox(box, matrix.transformBox(treeBox));
        }
        return box;
    },

    getOrderHint: function(node) {
        return [];
    }
});