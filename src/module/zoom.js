KityMinder.registerModule('Zoom', function() {
    var me = this;

    var timeline;

    me.setDefaultOptions('zoom', [10, 20, 30, 50, 80, 100, 120, 150, 200]);

    function setTextRendering() {
        var value = me._zoomValue >= 100 ? 'optimize-speed' : 'geometricPrecision';
        me.getRenderContainer().setAttr('text-rendering', value);
    }

    function fixPaperCTM(paper) {
        var node = paper.shapeNode;
        var ctm = node.getCTM();
        var matrix = new kity.Matrix(ctm.a, ctm.b, ctm.c, ctm.d, (ctm.e | 0) + 0.5, (ctm.f | 0) + 0.5);
        node.setAttribute('transform', 'matrix(' + matrix.toString() + ')');
    }

    kity.extendClass(Minder, {
        zoom: function(value) {
            var paper = this.getPaper();
            var viewport = paper.getViewPort();
            viewport.zoom = value / 100;
            viewport.center = {
                x: viewport.center.x,
                y: viewport.center.y
            };
            paper.setViewPort(viewport);
            if (value == 100) fixPaperCTM(paper);
        },
        getZoomValue: function() {
            return this._zoomValue;
        }
    });

    function zoomMinder(minder, value) {
        var paper = minder.getPaper();
        var viewport = paper.getViewPort();

        if (!value) return;

        setTextRendering();

        if (minder.getRoot().getComplex() > 200) {
            minder._zoomValue = value;
            minder.zoom(value);
            minder.fire('viewchange');
        } else {
            var animator = new kity.Animator({
                beginValue: minder._zoomValue,
                finishValue: value,
                setter: function(target, value) {
                    target.zoom(value);
                }
            });
            minder._zoomValue = value;
            if (timeline) {
                timeline.pause();
            }
            timeline = animator.start(minder, 300, 'easeInOutSine');
            timeline.on('finish', function() {
                minder.fire('viewchange');
            });
        }
        minder.fire('zoom', { zoom: value });
    }

    var ZoomCommand = kity.createClass('Zoom', {
        base: Command,
        execute: zoomMinder,
        queryValue: function(minder) {
            return minder._zoomValue;
        }
    });

    var ZoomInCommand = kity.createClass('ZoomInCommand', {
        base: Command,
        execute: function(minder) {
            zoomMinder(minder, this.nextValue(minder));
        },
        queryState: function(minder) {
            return +!this.nextValue(minder);
        },
        nextValue: function(minder) {
            var stack = minder.getOptions('zoom'),
                i;
            for (i = 0; i < stack.length; i++) {
                if (stack[i] > minder._zoomValue) return stack[i];
            }
            return 0;
        },
        enableReadOnly: true
    });

    var ZoomOutCommand = kity.createClass('ZoomOutCommand', {
        base: Command,
        execute: function(minder) {
            zoomMinder(minder, this.nextValue(minder));
        },
        queryState: function(minder) {
            return +!this.nextValue(minder);
        },
        nextValue: function(minder) {
            var stack = minder.getOptions('zoom'),
                i;
            for (i = stack.length - 1; i >= 0; i--) {
                if (stack[i] < minder._zoomValue) return stack[i];
            }
            return 0;
        },
        enableReadOnly: true
    });

    return {
        init: function() {
            this._zoomValue = 100;
            setTextRendering();
        },
        commands: {
            'zoom-in': ZoomInCommand,
            'zoom-out': ZoomOutCommand,
            'zoom': ZoomCommand
        },
        events: {
            'normal.mousewheel readonly.mousewheel': function(e) {
                if (!e.originEvent.ctrlKey && !e.originEvent.metaKey) return;

                var delta = e.originEvent.wheelDelta;
                var me = this;

                if (!kity.Browser.mac) {
                    delta = -delta;
                }

                // 稀释
                if (Math.abs(delta) > 100) {
                    clearTimeout(this._wheelZoomTimeout);
                } else {
                    return;
                }

                this._wheelZoomTimeout = setTimeout(function() {
                    var value;
                    var lastValue = me.getPaper()._zoom || 1;
                    if (delta < 0) {
                        me.execCommand('zoom-in');
                    } else if (delta > 0) {
                        me.execCommand('zoom-out');
                    }
                }, 100);

                e.originEvent.preventDefault();
            }
        },

        commandShortcutKeys: {
            'zoom-in': 'ctrl+=',
            'zoom-out': 'ctrl+-'
        }
    };
});