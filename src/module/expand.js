/* global Renderer: true */

KityMinder.registerModule('Expand', function() {
    var minder = this;
    var EXPAND_STATE_DATA = 'expandState',
        STATE_EXPAND = 'expand',
        STATE_COLLAPSE = 'collapse';

    // 将展开的操作和状态读取接口拓展到 MinderNode 上
    kity.extendClass(MinderNode, {

        /**
         * 展开节点
         * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
         */
        expand: function() {
            this.setData(EXPAND_STATE_DATA, STATE_EXPAND);
            return this;
        },

        /**
         * 收起节点
         */
        collapse: function() {
            this.setData(EXPAND_STATE_DATA, STATE_COLLAPSE);
            return this;
        },

        /**
         * 判断节点当前的状态是否为展开
         */
        isExpanded: function() {
            var expanded = this.getData(EXPAND_STATE_DATA) !== STATE_COLLAPSE;
            return expanded && (this.isRoot() || this.parent.isExpanded());
        },

        /**
         * 判断节点当前的状态是否为收起
         */
        isCollapsed: function() {
            return !this.isExpanded();
        }
    });

    var ExpandCommand = kity.createClass('ExpandCommand', {
        base: Command,

        execute: function(km, justParents) {
            var node = km.getSelectedNode();
            if (!node) return;
            if (justParents) {
                node = node.parent;
            }
            while(node.parent) {
                node.expand();
                node = node.parent;
            }
            node.renderTree();
            km.layout(100);
        },

        queryState: function(km) {
            return km.getSelectedNode() ? 0 : -1;
        }
    });

    var ExpandToLevelCommand = kity.createClass('ExpandToLevelCommand', {
        base: Command,
        execute: function(km, level) {
            km.getRoot().traverse(function(node) {
                if (node.getLevel() < level) node.expand();
                if (node.getLevel() == level) node.collapse();
            });
            km.refresh(100);
        },
        enableReadOnly: true
    });

    var Expander = kity.createClass('Expander', {
        base: kity.Group,

        constructor: function(node) {
            this.callBase();
            this.radius = 6;
            this.outline = new kity.Circle(this.radius).stroke('gray').fill('white');
            this.sign = new kity.Path().stroke('gray');
            this.addShapes([this.outline, this.sign]);
            this.initEvent(node);
            this.setId(KityMinder.uuid('node_expander'));
            this.setStyle('cursor', 'pointer');
        },

        initEvent: function(node) {
            this.on('mousedown', function(e) {
                if (node.isExpanded()) {
                    node.collapse();
                } else {
                    node.expand();
                }
                node.renderTree().getMinder().layout(100);
                node.getMinder().fire('contentchange');
                e.stopPropagation();
                e.preventDefault();
            });
            this.on('dblclick click mouseup', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });
        },

        setState: function(state) {
            if (state == 'hide') {
                this.setVisible(false);
                return;
            }
            this.setVisible(true);
            var pathData = ['M', 1.5 - this.radius, 0, 'L', this.radius - 1.5, 0];
            if (state == STATE_COLLAPSE) {
                pathData.push(['M', 0, 1.5 - this.radius, 'L', 0, this.radius - 1.5]);
            }
            this.sign.setPathData(pathData);
        }
    });

    var ExpanderRenderer = kity.createClass('ExpanderRenderer', {
        base: Renderer,

        create: function(node) {
            if (node.isRoot()) return;
            this.expander = new Expander(node);
            node.getRenderContainer().prependShape(this.expander);
            node.expanderRenderer = this;
            this.node = node;
            return this.expander;
        },

        shouldRender: function(node) {
            return !node.isRoot();
        },

        update: function(expander, node, box) {
            if (!node.parent) return;

            var visible = node.parent.isExpanded();

            expander.setState(visible && node.children.length ? node.getData(EXPAND_STATE_DATA) : 'hide');

            var vector = node.getLayoutVectorIn().normalize(expander.radius + node.getStyle('stroke-width'));
            var position = node.getVertexIn().offset(vector.reverse());

            this.expander.setTranslate(position);
        }
    });
    return {
        commands: {
            'expand': ExpandCommand,
            'expandtolevel': ExpandToLevelCommand
        },
        events: {
            'layoutapply': function(e) {
                var r = e.node.getRenderer('ExpanderRenderer');
                if (r.getRenderShape()) {
                    r.update(r.getRenderShape(), e.node);
                }
            },
            'beforerender': function(e) {
                var node = e.node;
                var visible = !node.parent || node.parent.isExpanded();
                var minder = this;

                node.getRenderContainer().setVisible(visible);
                if (!visible) e.stopPropagation();
            },
            'normal.keydown': function(e) {
                if (this.getStatus() == 'textedit') return;
                if (e.originEvent.keyCode == keymap['/']) {
                    var node = this.getSelectedNode();
                    if (!node || node == this.getRoot()) return;
                    var expanded = node.isExpanded();
                    this.getSelectedNodes().forEach(function(node) {
                        if (expanded) node.collapse();
                        else node.expand();
                        node.renderTree();
                    });
                    this.layout(100);
                    this.fire('contentchange');
                    e.preventDefault();
                    e.stopPropagationImmediately();
                }
                if (e.isShortcutKey('Alt+`')) {
                    this.execCommand('expandtolevel', 9999);
                }
                for (var i = 1; i < 6; i++) {
                    if (e.isShortcutKey('Alt+' + i)) {
                        this.execCommand('expandtolevel', i);
                    }
                }
            }
        },
        renderers: {
            outside: ExpanderRenderer
        },
        contextmenu: [{
            command: 'expandtoleaf',
            query: function() {
                return !minder.getSelectedNode();
            },
            fn: function(minder) {
                minder.execCommand('expandtolevel', 9999);
            }
        }, {
            command: 'expandtolevel1',
            query: function() {
                return !minder.getSelectedNode();
            },
            fn: function(minder) {
                minder.execCommand('expandtolevel', 1);
            }
        }, {
            command: 'expandtolevel2',
            query: function() {
                return !minder.getSelectedNode();
            },
            fn: function(minder) {
                minder.execCommand('expandtolevel', 2);
            }
        },{
            command: 'expandtolevel3',
            query: function() {
                return !minder.getSelectedNode();
            },
            fn: function(minder) {
                minder.execCommand('expandtolevel', 3);
            }
        }, {
            divider: true
        }]
    };
});