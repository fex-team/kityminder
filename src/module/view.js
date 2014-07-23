var ViewDragger = kity.createClass("ViewDragger", {
    constructor: function(minder) {
        this._minder = minder;
        this._enabled = false;
        this._bind();
    },
    isEnabled: function() {
        return this._enabled;
    },
    setEnabled: function(value) {
        var paper = this._minder.getPaper();
        paper.setStyle('cursor', value ? 'pointer' : 'default');
        paper.setStyle('cursor', value ? '-webkit-grab' : 'default');
        this._enabled = value;
    },
    move: function(offset, duration) {
        if (!duration) {
            this._minder.getRenderContainer().translate(offset.x | 0, offset.y | 0);
        } else {
            this._minder.getRenderContainer().fxTranslate(offset.x | 0, offset.y | 0, duration, 'easeOutCubic');
        }
    },

    _bind: function() {
        var dragger = this,
            isTempDrag = false,
            lastPosition = null,
            currentPosition = null;

        function dragEnd(e) {
            lastPosition = null;

            e.stopPropagation();

            // 临时拖动需要还原状态
            if (isTempDrag) {
                dragger.setEnabled(false);
                isTempDrag = false;
                if (dragger._minder.getStatus() == 'hand')
                    dragger._minder.rollbackStatus();
            }
        }

        this._minder.on('normal.mousedown normal.touchstart ' +
            'inputready.mousedown inputready.touchstart ' +
            'readonly.mousedown readonly.touchstart', function(e) {
                if (e.originEvent.button == 2) {
                    e.originEvent.preventDefault(); // 阻止中键拉动
                }
                // 点击未选中的根节点临时开启
                if (e.getTargetNode() == this.getRoot() || e.originEvent.button == 2) {
                    lastPosition = e.getPosition();
                    isTempDrag = true;
                }
            })

        .on('normal.mousemove normal.touchmove ' +
            'readonly.touchmove readonly.mousemove ' +
            'inputready.mousemove inputready.touchmove', function(e) {
                if (!isTempDrag) return;
                var offset = kity.Vector.fromPoints(lastPosition, e.getPosition());
                if (offset.length() > 3) this.setStatus('hand');
            })

        .on('hand.beforemousedown hand.beforetouchstart', function(e) {
            // 已经被用户打开拖放模式
            if (dragger.isEnabled()) {
                lastPosition = e.getPosition();
                e.stopPropagation();
            }
        })

        .on('hand.beforemousemove hand.beforetouchmove', function(e) {
            if (lastPosition) {
                currentPosition = e.getPosition();

                // 当前偏移加上历史偏移
                var offset = kity.Vector.fromPoints(lastPosition, currentPosition);
                dragger.move(offset);
                e.stopPropagation();
                e.preventDefault();
                e.originEvent.preventDefault();
                lastPosition = currentPosition;
            }
        })

        .on('mouseup touchend', dragEnd);

        window.addEventListener('mouseup', dragEnd);
    }
});

KityMinder.registerModule('View', function() {

    var km = this;

    var ToggleHandCommand = kity.createClass('ToggleHandCommand', {
        base: Command,
        execute: function(minder) {

            if (minder.getStatus() != 'hand') {
                minder.setStatus('hand');
            } else {
                minder.rollbackStatus();
            }
            this.setContentChanged(false);

        },
        queryState: function(minder) {
            return minder.getStatus() == 'hand' ? 1 : 0;
        },
        enableReadOnly: false
    });

    var CameraCommand = kity.createClass('CameraCommand', {
        base: Command,
        execute: function(km, focusNode, duration) {
            focusNode = focusNode || km.getRoot();
            var viewport = km.getPaper().getViewPort();
            var offset = focusNode.getRenderContainer().getRenderBox('view');
            var dx = viewport.center.x - offset.x - offset.width / 2,
                dy = viewport.center.y - offset.y;
            var dragger = km._viewDragger;

            dragger.move(new kity.Point(dx, dy), duration);
            this.setContentChanged(false);
        },
        enableReadOnly: false
    });

    var MoveCommand = kity.createClass('MoveCommand', {
        base: Command,

        execute: function(km, dir) {
            var dragger = this._viewDragger;
            var size = km._lastClientSize;
            switch (dir) {
                case 'up':
                    dragger.move(new kity.Point(0, -size.height / 2));
                    break;
                case 'down':
                    dragger.move(new kity.Point(0, size.height / 2));
                    break;
                case 'left':
                    dragger.move(new kity.Point(-size.width / 2, 0));
                    break;
                case 'right':
                    dragger.move(new kity.Point(size.width / 2, 0));
                    break;
            }
        }
    });

    return {
        init: function() {
            this._viewDragger = new ViewDragger(this);
        },
        commands: {
            'hand': ToggleHandCommand,
            'camera': CameraCommand,
            'move': MoveCommand
        },
        events: {
            keyup: function(e) {
                if (e.originEvent.keyCode == keymap.Spacebar && this.getSelectedNodes().length === 0) {
                    this.execCommand('hand');
                    e.preventDefault();
                }
            },
            statuschange: function(e) {
                this._viewDragger.setEnabled(e.currentStatus == 'hand');
            },
            mousewheel: function(e) {
                var dx, dy;
                e = e.originEvent;
                if (e.ctrlKey || e.shiftKey) return;
                if ('wheelDeltaX' in e) {

                    dx = e.wheelDeltaX || 0;
                    dy = e.wheelDeltaY || 0;

                } else {

                    dx = 0;
                    dy = e.wheelDelta;

                }

                this._viewDragger.move({
                    x: dx / 2.5,
                    y: dy / 2.5
                });

                e.preventDefault();
            },
            'normal.dblclick readonly.dblclick': function(e) {
                if (e.kityEvent.targetShape instanceof kity.Paper) {
                    this.execCommand('camera', this.getRoot(), 800);
                }
            },
            ready: function() {
                this.execCommand('camera', null, 0);
                this._lastClientSize = {
                    width: this.getRenderTarget().clientWidth,
                    height: this.getRenderTarget().clientHeight
                };
            },
            resize: function(e) {
                var a = {
                        width: this.getRenderTarget().clientWidth,
                        height: this.getRenderTarget().clientHeight
                    },
                    b = this._lastClientSize;
                this.getRenderContainer().translate(
                    (a.width - b.width) / 2 | 0, (a.height - b.height) / 2 | 0);
                this._lastClientSize = a;
            }
        }
    };
});