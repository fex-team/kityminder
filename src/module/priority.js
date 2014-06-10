KityMinder.registerModule('PriorityModule', function() {
    var minder = this;

    // 进度图标使用的颜色
    var PRIORITY_COLORS = ['', '#A92E24', '#29A6BD',
        '#1E8D54', '#eb6100', '#876DDA', '#828282',
        '#828282', '#828282', '#828282'
    ];
    var PRIORITY_DATA = 'priority';

    // 进度图标的图形
    var PriorityIcon = kity.createClass('PriorityIcon', {
        base: kity.Group,

        constructor: function() {
            this.callBase();
            this.setSize(20);
            this.create();
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

    // 提供的命令
    var PriorityCommand = kity.createClass('SetPriorityCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData(PRIORITY_DATA, value).render();
            }
            km.layout();
        },
        queryValue: function(km) {
            var nodes = km.getSelectedNodes();
            var val;
            for (var i = 0; i < nodes.length; i++) {
                val = nodes[i].getData(PRIORITY_DATA);
                if (val) break;
            }
            return val;
        }
    });
    return {
        'commands': {
            'priority': PriorityCommand,
        },
        'renderers': {
            left: kity.createClass('PriorityRenderer', {
                base: KityMinder.Renderer,

                create: function(node) {
                    this.priority = new PriorityIcon();
                    node.getRenderContainer().addShape(this.priority);
                },

                update: function(node, box) {
                    var data = node.getData(PRIORITY_DATA);
                    var spaceLeft = node.getStyle('space-left');
                    var icon = this.priority;
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