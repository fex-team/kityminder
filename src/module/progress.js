KityMinder.registerModule('ProgressModule', function() {
    var minder = this;

    var PROGRESS_DATA = 'progress';

    // 进度图标的图形
    var ProgressIcon = kity.createClass('ProgressIcon', {
        base: kity.Group,

        constructor: function(value) {
            this.callBase();
            this.setSize(20);
            this.create();
            this.setValue(value);
            this.setId(KityMinder.uuid('node_progress'));
        },

        setSize: function(size) {
            this.width = this.height = size;
        },

        create: function() {

            var circle = new kity.Circle(8)
                .stroke('#29A6BD', 2)
                .fill('white');

            var pie = new kity.Pie(6, 0, -90)
                .fill('#29A6BD');

            var check = new kity.Path()
                .getDrawer()
                    .moveTo(-3, 0)
                    .lineTo(-1, 3)
                    .lineTo(3, -2)
                .getPath()
                .setVisible(false);

            this.addShapes([circle, pie, check]);
            this.circle = circle;
            this.pie = pie;
            this.check = check;
        },

        setValue: function(value) {
            this.pie.setAngle(360 * (value - 1) / 8);
            this.check.setVisible(value == 9);
        }
    });

    var ProgressCommand = kity.createClass('ProgressCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData(PROGRESS_DATA, value).render();
            }
            km.layout();
        },
        queryValue: function(km) {
            var nodes = km.getSelectedNodes();
            var val;
            for (var i = 0; i < nodes.length; i++) {
                val = nodes[i].getData(PROGRESS_DATA);
                if (val) break;
            }
            return val;
        }
    });

    return {
        'commands': {
            'progress': ProgressCommand
        },
        'renderers': {
            left: kity.createClass('ProgressRenderer', {
                base: KityMinder.Renderer,

                create: function(node) {
                    return new ProgressIcon();
                },

                shouldRender: function(node) {
                    return node.getData(PROGRESS_DATA);
                },

                update: function(icon, node, box) {
                    var data = node.getData(PROGRESS_DATA);
                    var spaceLeft = node.getStyle('space-left');
                    var x, y;

                    icon.setValue(data);

                    x = box.left - icon.width - spaceLeft;
                    y = -icon.height / 2;
                    icon.setTranslate(x + icon.width / 2, y + icon.height / 2);

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