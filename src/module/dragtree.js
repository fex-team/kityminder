var GM = KityMinder.Geometry;

// 矩形的变形动画定义

var MoveToParentCommand = kity.createClass('MoveToParentCommand', {
    base: Command,
    execute: function(minder, nodes, parent) {
        var node;
        for (var i = nodes.length - 1; i >= 0; i--) {
            node = nodes[i];
            if (node.parent) {
                node.parent.removeChild(node);
                parent.appendChild(node);
                node.render();
            }
        }
        parent.expand();
        minder.select(nodes, true);
    }
});

var DropHinter = kity.createClass('DropHinter', {
    base: kity.Group,

    constructor: function() {
        this.callBase();
        this.rect = new kity.Rect();
        this.addShape(this.rect);
    },

    render: function(target) {
        this.setVisible(!!target);
        if (target) {
            this.rect
                .setBox(target.getLayoutBox())
                .setRadius(target.getStyle('radius') || 0)
                .stroke(
                    target.getStyle('drop-hint-color') || 'yellow',
                    target.getStyle('drop-hint-width') || 2
            );
            this.bringTop();
        }
    }
});

var OrderHinter = kity.createClass('OrderHinter', {
    base: kity.Group,

    constructor: function() {
        this.callBase();
        this.area = new kity.Rect();
        this.path = new kity.Path();
        this.addShapes([this.area, this.path]);
    },

    render: function(hint) {
        this.setVisible(!!hint);
        if (hint) {
            this.area.setBox(hint.area);
            this.area.fill(hint.node.getStyle('order-hint-area-color') || 'rgba(0, 255, 0, .5)');
            this.path.setPathData(hint.path);
            this.path.stroke(
                hint.node.getStyle('order-hint-path-color') || '#0f0',
                hint.node.getStyle('order-hint-path-width') || 1);
        }
    }
});

// 对拖动对象的一个替代盒子，控制整个拖放的逻辑，包括：
//    1. 从节点列表计算出拖动部分
//    2. 计算可以 drop 的节点，产生 drop 交互提示
var TreeDragger = kity.createClass('TreeDragger', {

    constructor: function(minder) {
        this._minder = minder;
        this._dropHinter = new DropHinter();
        this._orderHinter = new OrderHinter();
        minder.getRenderContainer().addShapes([this._dropHinter, this._orderHinter]);
    },

    dragStart: function(position) {
        // 只记录开始位置，不马上开启拖放模式
        // 这个位置同时是拖放范围收缩时的焦点位置（中心）
        this._startPosition = position;
    },

    dragMove: function(position) {
        // 启动拖放模式需要最小的移动距离
        var DRAG_MOVE_THRESHOLD = 10;

        if (!this._startPosition) return;

        var movement = kity.Vector.fromPoints(this._dragPosition || this._startPosition, position);
        var minder = this._minder;

        this._dragPosition = position;

        if (!this._dragMode) {
            // 判断拖放模式是否该启动
            if (GM.getDistance(this._dragPosition, this._startPosition) < DRAG_MOVE_THRESHOLD) {
                return;
            }
            if (!this._enterDragMode()) {
                return;
            }
        }

        for (var i = 0; i < this._dragSources.length; i++) {
            this._dragSources[i].setLayoutOffset(this._dragSources[i].getLayoutOffset().offset(movement));
            minder.applyLayoutResult(this._dragSources[i]);
        }
        
        if (!this._dropTest()) {
            this._orderTest();
        } else {
            this._renderOrderHint(this._orderSucceedHint = null);
        }
    },

    dragEnd: function() {
        this._startPosition = null;
        this._dragPosition = null;

        if (!this._dragMode) {
            return;
        }

        this._fadeDragSources(1);

        if (this._dropSucceedTarget) {

            this._dragSources.forEach(function(source) {
                source.setLayoutOffset(null);
            });
            
            this._minder.layout(-1);

            this._minder.execCommand('movetoparent', this._dragSources, this._dropSucceedTarget);

        } else if (this._orderSucceedHint) {

            var hint = this._orderSucceedHint;
            var index = hint.node.getIndex();

            var sourceIndexes = this._dragSources.map(function(source) {
                // 顺便干掉布局偏移
                source.setLayoutOffset(null);
                return source.getIndex();
            });

            var maxIndex = Math.max.apply(Math, sourceIndexes);
            var minIndex = Math.min.apply(Math, sourceIndexes);

            if (index < minIndex && hint.type == 'down') index++;
            if (index > maxIndex && hint.type == 'up') index--;

            hint.node.setLayoutOffset(null);

            this._minder.execCommand('arrange', this._dragSources, index);
            this._renderOrderHint(null);
        } else {
            this._minder.fire('savescene');
        }
        this._minder.layout(300);
        this._leaveDragMode();
        this._minder.fire('contentchange');
    },

    // 进入拖放模式：
    //    1. 计算拖放源和允许的拖放目标
    //    2. 标记已启动
    _enterDragMode: function() {
        this._calcDragSources();
        if (!this._dragSources.length) {
            this._startPosition = null;
            return false;
        }
        this._fadeDragSources(0.5);
        this._calcDropTargets();
        this._calcOrderHints();
        this._dragMode = true;
        this._minder.setStatus('dragtree');
        return true;
    },

    // 从选中的节点计算拖放源
    //    并不是所有选中的节点都作为拖放源，如果选中节点中存在 A 和 B，
    //    并且 A 是 B 的祖先，则 B 不作为拖放源
    //
    //    计算过程：
    //       1. 将节点按照树高排序，排序后只可能是前面节点是后面节点的祖先
    //       2. 从后往前枚举排序的结果，如果发现枚举目标之前存在其祖先，
    //          则排除枚举目标作为拖放源，否则加入拖放源
    _calcDragSources: function() {
        this._dragSources = this._minder.getSelectedAncestors();
    },

    _fadeDragSources: function(opacity) {
        var minder = this._minder;
        this._dragSources.forEach(function(source) {
            source.getRenderContainer().setOpacity(opacity, 200);
            source.traverse(function(node) {
                if (opacity < 1) {
                    minder.detachNode(node);
                } else {
                    minder.attachNode(node);
                }
            }, true);
        });
    },


    // 计算拖放目标可以释放的节点列表（释放意味着成为其子树），存在这条限制规则：
    //    - 不能拖放到拖放目标的子树上（允许拖放到自身，因为多选的情况下可以把其它节点加入）
    //
    //    1. 加入当前节点（初始为根节点）到允许列表
    //    2. 对于当前节点的每一个子节点：
    //       (1) 如果是拖放目标的其中一个节点，忽略（整棵子树被剪枝）
    //       (2) 如果不是拖放目标之一，以当前子节点为当前节点，回到 1 计算
    //    3. 返回允许列表
    //
    _calcDropTargets: function() {

        function findAvailableParents(nodes, root) {
            var availables = [],
                i;
            availables.push(root);
            root.getChildren().forEach(function(test) {
                for (i = 0; i < nodes.length; i++) {
                    if (nodes[i] == test) return;
                }
                availables = availables.concat(findAvailableParents(nodes, test));
            });
            return availables;
        }

        this._dropTargets = findAvailableParents(this._dragSources, this._minder.getRoot());
        this._dropTargetBoxes = this._dropTargets.map(function(source) {
            return source.getLayoutBox();
        });
    },

    _calcOrderHints: function() {
        var sources = this._dragSources;
        var ancestor = MinderNode.getCommonAncestor(sources);

        // 只有一个元素选中，公共祖先是其父
        if (ancestor == sources[0]) ancestor = sources[0].parent;

        if (sources.length === 0 || ancestor != sources[0].parent) {
            this._orderHints = [];
            return;
        }

        var siblings = ancestor.children;

        this._orderHints = siblings.reduce(function(hint, sibling) {
            if (sources.indexOf(sibling) == -1) {
                hint = hint.concat(sibling.getOrderHint());
            }
            return hint;
        }, []);
    },

    _leaveDragMode: function() {
        this._dragMode = false;
        this._dropSucceedTarget = null;
        this._orderSucceedHint = null;
        this._renderDropHint(null);
        this._renderOrderHint(null);
        this._minder.rollbackStatus();
    },

    _drawForDragMode: function() {
        this._text.setContent(this._dragSources.length + ' items');
        this._text.setPosition(this._startPosition.x, this._startPosition.y + 5);
        this._minder.getRenderContainer().addShape(this);
    },

    _boxTest: function(targets, targetBoxMapper, judge) {
        var sourceBoxes = this._dragSources.map(function(source) {
            return source.getLayoutBox();
        });

        var i, j, target, sourceBox, targetBox;

        judge = judge || function(intersectBox, sourceBox, targetBox) {
            return intersectBox;
        };

        for (i = 0; i < targets.length; i++) {

            target = targets[i];
            targetBox = targetBoxMapper.call(this, target, i);

            for (j = 0; j < sourceBoxes.length; j++) {
                sourceBox = sourceBoxes[j];

                var intersectBox = GM.getIntersectBox(sourceBox, targetBox);
                if (judge(intersectBox, sourceBox, targetBox)) {
                    return target;
                }
            }
        }

        return null;
    },

    _dropTest: function() {
        this._dropSucceedTarget = this._boxTest(this._dropTargets, function(target, i) {
            return this._dropTargetBoxes[i];
        }, function(intersectBox, sourceBox, targetBox) {
            function area(box) {
                return box.width * box.height;
            }
            if (!intersectBox) return false;
            // 面积判断
            if (area(intersectBox) > 0.5 * Math.min(area(sourceBox), area(targetBox))) return true;
            if (intersectBox.width + 1 >= Math.min(sourceBox.width, targetBox.width)) return true;
            if (intersectBox.height + 1 >= Math.min(sourceBox.height, targetBox.height)) return true;
            return false;
        });
        this._renderDropHint(this._dropSucceedTarget);
        return !!this._dropSucceedTarget;
    },

    _orderTest: function() {
        this._orderSucceedHint = this._boxTest(this._orderHints, function(hint) {
            return hint.area;
        });
        this._renderOrderHint(this._orderSucceedHint);
        return !!this._orderSucceedHint;
    },

    _renderDropHint: function(target) {
        this._dropHinter.render(target);
    },

    _renderOrderHint: function(hint) {
        this._orderHinter.render(hint);
    },
    preventDragMove: function() {
        this._startPosition = null;
    }
});

KityMinder.registerModule('DragTree', function() {
    var dragger;

    return {
        init: function() {
            dragger = new TreeDragger(this);
            window.addEventListener('mouseup', function() {
                dragger.dragEnd();
            });
        },
        events: {
            'normal.mousedown inputready.mousedown': function(e) {
                // 单选中根节点也不触发拖拽
                if (e.originEvent.button) return;
                if (e.getTargetNode() && e.getTargetNode() != this.getRoot()) {
                    dragger.dragStart(e.getPosition(this.getRenderContainer()));
                }
            },
            'normal.mousemove dragtree.mousemove': function(e) {
                dragger.dragMove(e.getPosition(this.getRenderContainer()));
            },
            'normal.mouseup dragtree.beforemouseup': function(e) {
                dragger.dragEnd();
                //e.stopPropagation();
                e.preventDefault();
            },
            'statuschange': function(e) {
                if (e.lastStatus == 'textedit' && e.currentStatus == 'normal') {
                    dragger.preventDragMove();
                }
            }
        },
        commands: {
            'movetoparent': MoveToParentCommand
        }
    };
});