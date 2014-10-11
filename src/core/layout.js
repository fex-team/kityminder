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
    },

    getLayoutList: function() {
        return this._layout;
    },

    getLayoutInstance: function(name) {
        var LayoutClass = KityMinder._layout[name];
        var layout = new LayoutClass();
        if (!layout) throw new Error('Missing Layout: ' + name);
        return layout;
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

    setLayout: function(name) {
        if (name) {
            if (name == 'inherit') {
                this.setData('layout');
            } else {
                this.setData('layout', name);
            }
        }
        return this;
    },

    layout: function(name, duration) {

        this.setLayout(name).getMinder().layout(duration);

        return this;
    },

    getLayoutInstance: function() {
        return KityMinder.getLayoutInstance(this.getLayout());
    },

    getOrderHint: function(refer) {
        return this.parent.getLayoutInstance().getOrderHint(this);
    },

    getExpandPosition: function() {
        return this.getLayoutInstance().getExpandPosition();
    },

    /**
     * 获取当前节点相对于父节点的布局变换
     */
    getLayoutTransform: function() {
        return this._layoutTransform || new kity.Matrix();
    },

    /**
     * 第一轮布局计算后，获得的全局布局位置
     *
     * @return {[type]} [description]
     */
    getGlobalLayoutTransformPreview: function() {
        var pMatrix = this.parent ? this.parent.getLayoutTransform() : new kity.Matrix();
        var matrix = this.getLayoutTransform();
        var offset = this.getLayoutOffset();
        if (offset) {
            matrix.translate(offset.x, offset.y);
        }
        return pMatrix.merge(matrix);
    },

    getLayoutPointPreview: function() {
        return this.getGlobalLayoutTransformPreview().transformPoint(new kity.Point());
    },

    /**
     * 获取节点相对于全局的布局变换
     */
    getGlobalLayoutTransform: function() {
        if (this._globalLayoutTransform) {
            return this._globalLayoutTransform;
        } else if (this.parent) {
            return this.parent.getGlobalLayoutTransform();
        } else {
            return new kity.Matrix();
        }
    },

    /**
     * 设置当前节点相对于父节点的布局变换
     */
    setLayoutTransform: function(matrix) {
        this._layoutTransform = matrix;
        return this;
    },

    /**
     * 设置当前节点相对于全局的布局变换（冗余优化）
     */
    setGlobalLayoutTransform: function(matrix) {
        this.getRenderContainer().setMatrix(this._globalLayoutTransform = matrix);
        return this;
    },

    setVertexIn: function(p) {
        this._vertexIn = p;
    },

    setVertexOut: function(p) {
        this._vertexOut = p;
    },

    getVertexIn: function() {
        return this._vertexIn || new kity.Point();
    },

    getVertexOut: function() {
        return this._vertexOut || new kity.Point();
    },

    getLayoutVertexIn: function() {
        return this.getGlobalLayoutTransform().transformPoint(this.getVertexIn());
    },

    getLayoutVertexOut: function() {
        return this.getGlobalLayoutTransform().transformPoint(this.getVertexOut());
    },

    setLayoutVectorIn: function(v) {
        this._layoutVectorIn = v;
        return this;
    },

    setLayoutVectorOut: function(v) {
        this._layoutVectorOut = v;
        return this;
    },

    getLayoutVectorIn: function() {
        return this._layoutVectorIn || new kity.Vector();
    },

    getLayoutVectorOut: function() {
        return this._layoutVectorOut || new kity.Vector();
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
        if (!this.parent) return new kity.Point();

        // 影响当前节点位置的是父节点的布局
        var data = this.getData('layout_' + this.parent.getLayout() + '_offset');

        if (data) return new kity.Point(data.x, data.y);

        return new kity.Point();
    },

    setLayoutOffset: function(p) {
        if (!this.parent) return this;

        if (p && !this.hasLayoutOffset()) {
            var m = this.getLayoutTransform().m;
            p = p.offset(m.e, m.f);
            this.setLayoutTransform(null);
        }

        this.setData('layout_' + this.parent.getLayout() + '_offset', p ? {
            x: p.x,
            y: p.y
        } : null);

        return this;
    },

    hasLayoutOffset: function() {
        return !!this.getData('layout_' + this.parent.getLayout() + '_offset');
    },

    resetLayoutOffset: function() {
        return this.setLayoutOffset(null);
    },

    getLayoutRoot: function() {
        if (this.isLayoutRoot()) {
            return this;
        }
        return this.parent.getLayoutRoot();
    },

    isLayoutRoot: function() {
        return this.getData('layout') || this.isRoot();
    }
});

Minder.registerInit(function(options) {
    this.refresh();
});

kity.extendClass(Minder, {

    layout: function(duration) {

        this.getRoot().traverse(function(node) {
            // clear last results
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
            layout.doLayout(node, node.getChildren().filter(function(child) {
                return !child.hasLayoutOffset();
            }));
        }

        // 第一轮布局
        layoutNode(this.getRoot());

        // 第二轮布局
        layoutNode(this.getRoot());

        duration = duration ? 300 : 0;

        var minder = this;
        this.applyLayoutResult(this.getRoot(), duration).then(function() {
            minder.fire('layoutallfinish');
        });

        return this.fire('layout');
    },

    refresh: function(duration) {
        this.getRoot().renderTree();
        this.layout(duration).fire('contentchange')._interactChange();
        return this;
    },

    applyLayoutResult: function(root, duration) {
        root = root || this.getRoot();
        var me = this;
        var deffered = {};

        var promise = new Promise(function(resolve, reject) {
            deffered.resolve = resolve;
            deffered.reject = reject;
        });

        var complex = root.getComplex();

        function consume() {
            if (!--complex) {
                deffered.resolve();
            }
        }

        // 节点复杂度大于 100，关闭动画
        if (complex > 200) duration = 0;

        function applyMatrix(node, matrix) {
            node.setGlobalLayoutTransform(matrix);

            me.fire('layoutapply', {
                node: node,
                matrix: matrix
            });
        }

        function apply(node, pMatrix) {
            var matrix = node.getLayoutTransform().merge(pMatrix);
            var lastMatrix = node.getGlobalLayoutTransform() || new kity.Matrix();

            var offset = node.getLayoutOffset();
            matrix.translate(offset.x, offset.y);

            matrix.m.e = Math.round(matrix.m.e);
            matrix.m.f = Math.round(matrix.m.f);


            // 如果当前有动画，停止动画
            if (node._layoutTimeline) {
                node._layoutTimeline.stop();
                node._layoutTimeline = null;
            }

            // 如果要求以动画形式来更新，创建动画
            if (duration) {
                node._layoutTimeline = new kity.Animator(lastMatrix, matrix, applyMatrix)
                    .start(node, duration, 'ease')
                    .on('finish', function() {
                        //可能性能低的时候会丢帧，手动添加一帧
                        setTimeout(function() {
                            applyMatrix(node, matrix);
                            me.fire('layoutfinish', {
                                node: node,
                                matrix: matrix
                            });
                            consume();
                        }, 150);
                    });
            }

            // 否则直接更新
            else {
                applyMatrix(node, matrix);
                me.fire('layoutfinish', {
                    node: node,
                    matrix: matrix
                });
                consume();
            }

            for (var i = 0; i < node.children.length; i++) {
                apply(node.children[i], matrix);
            }
        }

        apply(root, root.parent ? root.parent.getGlobalLayoutTransform() : new kity.Matrix());
        return promise;
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
     * 对齐指定的节点
     *
     * @param {Array<MinderNode>} nodes 要对齐的节点
     * @param {string} border 对齐边界，允许取值 left, right, top, bottom
     *
     */
    align: function(nodes, border, offset) {
        var me = this;
        offset = offset || 0;
        nodes.forEach(function(node) {
            var tbox = me.getTreeBox([node]);
            var matrix = node.getLayoutTransform();
            switch (border) {
                case 'left':
                    return matrix.translate(offset - tbox.left, 0);
                case 'right':
                    return matrix.translate(offset - tbox.right, 0);
                case 'top':
                    return matrix.translate(0, offset - tbox.top);
                case 'bottom':
                    return matrix.translate(0, offset - tbox.bottom);
            }
        });
    },

    stack: function(nodes, axis, distance) {
        var me = this;

        var position = 0;

        distance = distance || function(node, next, axis) {
            return node.getStyle({
                x: 'margin-right',
                y: 'margin-bottom'
            }[axis]) + next.getStyle({
                x: 'margin-left',
                y: 'margin-top'
            }[axis]);
        };

        nodes.forEach(function(node, index, nodes) {
            var tbox = me.getTreeBox([node]);

            var size = {
                x: tbox.width,
                y: tbox.height
            }[axis];
            var offset = {
                x: tbox.left,
                y: tbox.top
            }[axis];

            var matrix = node.getLayoutTransform();

            if (axis == 'x') {
                matrix.translate(position - offset, 0);
            } else {
                matrix.translate(0, position - offset);
            }
            position += size;
            if (nodes[index + 1])
                position += distance(node, nodes[index + 1], axis);
        });
        return position;
    },

    move: function(nodes, dx, dy) {
        nodes.forEach(function(node) {
            node.getLayoutTransform().translate(dx, dy);
        });
    },

    /**
     * 工具方法：获取给点的节点所占的布局区域
     *
     * @param  {MinderNode[]} nodes 需要计算的节点
     *
     * @return {Box} 计算结果
     */
    getBranchBox: function(nodes) {
        var box = new kity.Box();
        var i, node, matrix, contentBox;
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            matrix = node.getLayoutTransform();
            contentBox = node.getContentBox();
            box = box.merge(matrix.transformBox(contentBox));
        }

        return box;
    },

    /**
     * 工具方法：计算给定的节点的子树所占的布局区域
     *
     * @param  {MinderNode} nodes 需要计算的节点
     *
     * @return {Box} 计算的结果
     */
    getTreeBox: function(nodes) {

        var i, node, matrix, treeBox;

        var g = KityMinder.Geometry;

        var box = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };

        if (!(nodes instanceof Array)) nodes = [nodes];

        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            matrix = node.getLayoutTransform();

            treeBox = node.getContentBox();

            if (node.isExpanded() && node.children.length) {
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

var LayoutCommand = kity.createClass('LayoutCommand', {
    base: Command,

    execute: function(minder, name) {
        var nodes = minder.getSelectedNodes();
        nodes.forEach(function(node) {
            node.layout(name);
        });
    },

    queryValue: function(minder) {
        var node = minder.getSelectedNode();
        if (node) {
            return node.getData('layout');
        }
    },

    queryState: function(minder) {
        return minder.getSelectedNode() ? 0 : -1;
    }
});

var ResetLayoutCommand = kity.createClass('ResetLayoutCommand', {
    base: Command,

    execute: function(minder, name) {
        var nodes = minder.getSelectedNodes();

        if (!nodes.length) nodes = [minder.getRoot()];

        nodes.forEach(function(node) {
            node.traverse(function(child) {
                child.resetLayoutOffset();
                if (!child.isRoot()) {
                    child.setData('layout', null);
                }
            });
        });
        minder.layout(300);
    },

    enableReadOnly: true
});

KityMinder.registerModule('LayoutModule', {
    commands: {
        'layout': LayoutCommand,
        'resetlayout': ResetLayoutCommand
    },
    contextmenu: [{
        command: 'resetlayout'
    }, {
        divider: true
    }],

    commandShortcutKeys: {
        'resetlayout': 'Ctrl+Shift+L'
    }
});