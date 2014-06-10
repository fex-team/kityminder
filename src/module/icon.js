KityMinder.registerModule('IconModule', function() {
    var minder = this;

    var PRIORITY_COLORS = ['', '#A92E24', '#29A6BD', '#1E8D54', '#eb6100', '#876DDA', '#828282', '#828282', '#828282', '#828282'];

    var PriorityIcon = kity.createClass('PriorityIcon', {
        base: kity.Group,

        constructor: function(value) {
            this.callBase();
            this.setSize(20);
            this.create();
            this.setValue(value);
            this.setId(KityMinder.uuid('node_priority'));
        },

        setSize: function(size) {
            this.width = this.height = size;
        },

        create: function() {
            var bg, number;

            bg = new kity.Rect()
                .setRadius(3)
                .setPosition(0, 0)
                .setSize(this.width, this.height);

            number = new kity.Text()
                .setX(this.width / 2 + 0.5).setY(this.height / 2 + 0.5)
                .setTextAnchor('middle')
                .setVerticalAlign('middle')
                .setFontSize(12)
                .fill('white');
            number.mark = 'hello';

            this.addShapes([bg, number]);
            this.bg = bg;
            this.number = number;
        },

        setValue: function(value) {
            var bg = this.bg,
                number = this.number;

            if (PRIORITY_COLORS[value]) {
                bg.fill(PRIORITY_COLORS[value]);
                number.setContent(value);
            }
        }
    });

    var ProgressIcon = kity.createClass('ProgressIcon', {
        base: kity.Group,

        constructor: function(value) {
            this.callBase();
            this.create();
        }
    });

    var renderProgressIcon = function(node, val) {
        var _rc = new kity.Group();
        var _contRc = node.getContRc();
        var _bg = new kity.Circle().setRadius(8).fill('white').stroke(new kity.Pen('#29A6BD', 2));
        var _percent, d;
        if (val < 9) {
            _percent = new kity.Path();
            d = _percent.getDrawer();
            d.moveTo(0, 0).lineTo(0, -6);
        } else _percent = new kity.Group();
        _rc.addShapes([_bg, _percent]);
        _contRc.addShape(_rc);
        //r, laf, sf, x, y
        //large-arc-flag 为1 表示大角度弧线，0 代表小角度弧线。
        //sweep-flag 为1代表从起点到终点弧线绕中心顺时针方向，0 代表逆时针方向。
        switch (val) {
            case 1:
                break;
            case 2:
                d.carcTo(6, 0, 1, 6 * Math.cos(2 * Math.PI / 8), -6 * Math.sin(2 * Math.PI / 8));
                break;
            case 3:
                d.carcTo(6, 0, 1, 6, 0);
                break;
            case 4:
                d.carcTo(6, 0, 1, 6 * Math.cos(2 * Math.PI / 8), 6 * Math.sin(2 * Math.PI / 8));
                break;
            case 5:
                d.carcTo(6, 0, 1, 0, 6);
                break;
            case 6:
                d.carcTo(6, 1, 1, -6 * Math.cos(2 * Math.PI / 8), 6 * Math.sin(2 * Math.PI / 8));
                break;
            case 7:
                d.carcTo(6, 1, 1, -6, 0);
                break;
            case 8:
                d.carcTo(6, 1, 1, -6 * Math.cos(2 * Math.PI / 8), -6 * Math.sin(2 * Math.PI / 8));
                break;
            case 9:
                var check = new kity.Path();
                _percent.addShapes([new kity.Circle().setRadius(6).fill('#29A6BD'), check]);
                check.getDrawer().moveTo(-3, 0).lineTo(-1, 3).lineTo(3, -2);
                check.stroke(new kity.Pen('white', 2).setLineCap('round'));
                break;
        }
        if (val && val < 8) d.close();
        _percent.fill('#29A6BD');
        var pre = node.getData('PriorityIcon');
        var style = minder.getCurrentLayoutStyle()[node.getType()];
        if (!pre) _rc.setTranslate(_rc.getWidth() / 2, 0);
        else _rc.setTranslate(_contRc.getWidth() + style.spaceLeft, 0);
    };
    var PriorityCommand = kity.createClass('SetPriorityCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData('PriorityIcon', value).render();
            }
            km.layout();
        },
        queryValue: function(km) {
            var nodes = km.getSelectedNodes();
            var val;
            for (var i = 0; i < nodes.length; i++) {
                val = nodes[i].getData('PriorityIcon');
                if (val) break;
            }
            return val;
        }
    });
    var ProgressCommand = kity.createClass('SetProgressCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData('ProgressIcon', value).render();
            }
            km.layout();
        },
        queryValue: function(km) {
            var nodes = km.getSelectedNodes();
            var val;
            for (var i = 0; i < nodes.length; i++) {
                val = nodes[i].getData('ProgressIcon');
                if (val) break;
            }
            return val;
        }
    });
    return {
        'commands': {
            'priority': PriorityCommand,
            'progress': ProgressCommand
        },
        'renderers': {
            left: kity.createClass('Icon', {
                base: Renderer,

                create: function(node) {
                    this.priority = new PriorityIcon();
                    node.getRenderContainer().addShape(this.priority);
                },

                update: function(node) {
                    var data = node.getData('PriorityIcon');
                    var spaceLeft = node.getStyle('space-left');
                    var icon = this.priority;
                    var box = node.getContentBox();
                    var x, y;

                    if (!data) {
                        icon.setVisible(false);
                        return null;
                    }

                    icon.setVisible(true).setValue(data);

                    x = box.left - icon.width - spaceLeft;
                    y = -icon.height / 2;
                    icon.setTranslate(x, y);

                    return {
                        x: x,
                        y: y,
                        width: icon.width,
                        height: icon.height
                    };
                }
            })
        }
    };
});