/* global Renderer: true */

KityMinder.registerModule('Expand', function() {
    var minder = this;
    var EXPAND_STATE_DATA = 'expandState',
        STATE_EXPAND = 'expand',
        STATE_COLLAPSE = 'collapse';

    /**
     * 该函数返回一个策略，表示递归到节点指定的层数
     *
     * 返回的策略表示把操作（展开/收起）进行到指定的层数
     * 也可以给出一个策略指定超过层数的节点如何操作，默认不进行任何操作
     *
     * @param {int} deep_level 指定的层数
     * @param {Function} policy_after_level 超过的层数执行的策略
     */
    function generateDeepPolicy(deep_level, policy_after_level) {

        return function(node, state, policy, level) {
            var children, child, i;

            node.setData(EXPAND_STATE_DATA, state);
            level = level || 1;

            children = node.getChildren();

            for (i = 0; i < children.length; i++) {
                child = children[i];

                if (level <= deep_level) {
                    policy(child, state, policy, level + 1);
                } else if (policy_after_level) {
                    policy_after_level(child, state, policy, level + 1);
                }
            }

        };
    }

    /**
     * 节点展开和收缩的策略常量
     *
     * 策略是一个处理函数，处理函数接受 3 个参数：
     *
     * @param {MinderNode} node   要处理的节点
     * @param {Enum}       state  取值为 "expand" | "collapse"，表示要对节点进行的操作是展开还是收缩
     * @param {Function}   policy 提供当前策略的函数，方便递归调用
     */
    var EXPAND_POLICY = MinderNode.EXPAND_POLICY = {

        /**
         * 策略 1：只修改当前节点的状态，不递归子节点的状态
         */
        KEEP_STATE: function(node, state, policy) {
            node.setData(EXPAND_STATE_DATA, state);
        },

        generateDeepPolicy: generateDeepPolicy,

        /**
         * 策略 2：把操作进行到儿子
         */
        DEEP_TO_CHILD: generateDeepPolicy(1),

        /**
         * 策略 3：把操作进行到叶子
         */
        DEEP_TO_LEAF: generateDeepPolicy(Number.MAX_VALUE)
    };

    function setExpandState(node, state, policy) {
        policy = policy || EXPAND_POLICY.KEEP_STATE;
        policy(node, state, policy);
        node.traverse(function(node) {
            node.render();
        });
        node.getMinder().layout(200);
    }

    // 将展开的操作和状态读取接口拓展到 MinderNode 上
    kity.extendClass(MinderNode, {

        /**
         * 使用指定的策略展开节点
         * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
         */
        expand: function(policy) {
            setExpandState(this, STATE_EXPAND, policy);
            return this;
        },

        /**
         * 使用指定的策略收起节点
         * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
         */
        collapse: function(policy) {
            setExpandState(this, STATE_COLLAPSE, policy);
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
    var ExpandNodeCommand = kity.createClass('ExpandNodeCommand', {
        base: Command,
        execute: function(km) {
            var nodes = km.getSelectedNodes();
            nodes.forEach(function(node) {
                node.expand(EXPAND_POLICY.DEEP_TO_LEAF);
            });
        },
        queryState: function(km) {
            return 0;
        }
    });
    var CollapseNodeCommand = kity.createClass('CollapseNodeCommand', {
        base: Command,
        execute: function(km) {
            var nodes = km.getSelectedNodes();
            nodes.forEach(function(node) {
                node.collapse(EXPAND_POLICY.DEEP_TO_LEAF);
            });
        },
        queryState: function(km) {
            return 0;
        }
    });
    var Expander = kity.createClass('Expander', {
        base: kity.Group,

        constructor: function(node) {
            this.callBase();
            this.radius = 5;
            this.outline = new kity.Circle(this.radius).stroke('gray').fill('white');
            this.sign = new kity.Path().stroke('black');
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

            var x, y;

            var pos = node.getLayoutVector();

            pos = new kity.Vector(pos.x, pos.y);

            pos = pos.normalize(pos.length() + expander.radius + 1);

            this.expander.setTranslate(pos);
        }
    });
    return {
        addShortcutKeys: {
            'ExpandNode': 'ctrl+/', //expand
            'CollapseNode': 'ctrl+.' //collapse
        },
        commands: {
            'ExpandNode': ExpandNodeCommand,
            'CollapseNode': CollapseNodeCommand
        },
        events: {
            'layoutapply': function(e) {
                var r = e.node.getRenderer('ExpanderRenderer');
                r.update(r.getRenderShape(), e.node);
            },
            'preimport': function(e) {
                var json = e.json;
            },
            'beforerender': function(e) {
                var node = e.node;
                var visible = !node.parent || node.parent.isExpanded();
                node.getRenderContainer().setVisible(visible);
            }
        },
        renderers: {
            outside: ExpanderRenderer
        }
    };
});