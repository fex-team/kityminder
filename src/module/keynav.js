KityMinder.registerModule('KeyboardModule', function() {
    var min = Math.min,
        max = Math.max,
        abs = Math.abs,
        sqrt = Math.sqrt,
        exp = Math.exp;

    function buildPositionNetwork(root) {
        var pointIndexes = [],
            p;
        root.traverse(function(node) {
            p = node.getLayoutBox();

            // bugfix: 不应导航到收起的节点（判断其尺寸是否存在）
            if (p.width && p.height) {
                pointIndexes.push({
                    left: p.x,
                    top: p.y,
                    right: p.x + p.width,
                    bottom: p.y + p.height,
                    width: p.width,
                    height: p.height,
                    node: node,
                    text: node.getText()
                });
            }
        });
        for (var i = 0; i < pointIndexes.length; i++) {
            findClosestPointsFor(pointIndexes, i);
        }
    }

    // 这是金泉的点子，赞！
    // 求两个不相交矩形的最近距离
    function getCoefedDistance(box1, box2) {
        var xMin, xMax, yMin, yMax, xDist, yDist, dist, cx, cy;
        xMin = min(box1.left, box2.left);
        xMax = max(box1.right, box2.right);
        yMin = min(box1.top, box2.top);
        yMax = max(box1.bottom, box2.bottom);

        xDist = xMax - xMin - box1.width - box2.width;
        yDist = yMax - yMin - box1.height - box2.height;

        if (xDist < 0) dist = yDist;
        else if (yDist < 0) dist = xDist;
        else dist = sqrt(xDist * xDist + yDist * yDist);

        return {
            cx: dist,
            cy: dist
        };
    }

    function findClosestPointsFor(pointIndexes, iFind) {
        var find = pointIndexes[iFind];
        var most = {},
            quad;
        var current, dist;

        for (var i = 0; i < pointIndexes.length; i++) {

            if (i == iFind) continue;
            current = pointIndexes[i];

            dist = getCoefedDistance(current, find);

            // left check
            if (current.right < find.left) {
                if (!most.left || dist.cx < most.left.dist) {
                    most.left = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // right check
            if (current.left > find.right) {
                if (!most.right || dist.cx < most.right.dist) {
                    most.right = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // top check
            if (current.bottom < find.top) {
                if (!most.top || dist.cy < most.top.dist) {
                    most.top = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }

            // bottom check
            if (current.top > find.bottom) {
                if (!most.down || dist.cy < most.down.dist) {
                    most.down = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }
        }
        find.node._nearestNodes = {
            right: most.right && most.right.node || null,
            top: most.top && most.top.node || null,
            left: most.left && most.left.node || null,
            down: most.down && most.down.node || null
        };
    }

    function navigateTo(km, direction) {
        var referNode = km.getSelectedNode();
        if (!referNode) {
            km.select(km.getRoot());
            buildPositionNetwork(km.getRoot());
            return;
        }
        if (!referNode._nearestNodes) {
            buildPositionNetwork(km.getRoot());
        }
        var nextNode = referNode._nearestNodes[direction];
        if (nextNode) {
            km.select(nextNode, true);
        }
    }

    var NavigateToParentCommand = kity.createClass({
        base: Command,

        execute: function(km) {
            var node = km.getSelectedNode();
            if (node && node.parent) {
                km.select(node.parent, true);
            }
            this.setContentChanged(false);
        },

        queryState: function(km) {
            return km.getSelectedNode() ? 0 : -1;
        },

        enableReadOnly: true
    });

    // 稀释用
    var lastFrame;
    return {
        'commands': {
            'navparent': NavigateToParentCommand
        },
        'commandShortcutKeys': {
            'navparent': 'shift+tab'
        },
        'events': {
            'layoutallfinish': function() {
                var root = this.getRoot();
                buildPositionNetwork(root);
            },
            'normal.keydown readonly.keydown': function(e) {
                var minder = this;
                ['left', 'right', 'up', 'down'].forEach(function(key) {
                    if (e.isShortcutKey(key)) {
                        navigateTo(minder, key == 'up' ? 'top' : key);
                    }
                });
            },
            'normal.keyup': function(e) {
                if (browser.ipad) {
                    var keys = KityMinder.keymap;
                    var node = e.getTargetNode();
                    var lang = this.getLang();

                    if (this.receiver) this.receiver.keydownNode = node;

                    var keyEvent = e.originEvent;

                    if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey) return;

                    switch (keyEvent.keyCode) {
                        case keys.Enter:
                            this.execCommand('AppendSiblingNode', lang.topic);
                            e.preventDefault();
                            break;

                        case keys.Backspace:
                        case keys.Del:
                            e.preventDefault();
                            this.execCommand('RemoveNode');
                            break;

                    }
                }

            }
        }
    };
});