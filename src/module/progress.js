KityMinder.registerModule('ProgressModule', function() {
    var minder = this;

    var PROGRESS_DATA = 'progress';

    // Designed by Akikonata
    var BG_COLOR = '#FFED83';
    var PIE_COLOR = '#43BC00';
    var SHADOW_PATH = 'M10,3c4.418,0,8,3.582,8,8h1c0-5.523-3.477-10-9-10S1,5.477,1,11h1C2,6.582,5.582,3,10,3z';
    var SHADOW_COLOR = '#8E8E8E';
    var FRAME_PATH = 'M10,0C4.477,0,0,4.477,0,10c0,5.523,4.477,10,10,10s10-4.477,10-10C20,4.477,15.523,0,10,0zM10,18c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S14.418,18,10,18z';
    var FRAME_GRAD = new kity.LinearGradientBrush().pipe(function(g) {
        g.setStartPosition(0, 0);
        g.setEndPosition(0, 1);
        g.addStop(0, '#fff');
        g.addStop(1, '#ccc');
    });
    var CHECK_PATH = 'M15.812,7.896l-6.75,6.75l-4.5-4.5L6.25,8.459l2.812,2.803l5.062-5.053L15.812,7.896z';
    var CHECK_COLOR = '#EEE';

    minder.getPaper().addResource(FRAME_GRAD);

    // 进度图标的图形
    var ProgressIcon = kity.createClass('ProgressIcon', {
        base: kity.Group,

        constructor: function(value) {
            this.callBase();
            this.setSize(20);
            this.create();
            this.setValue(value);
            this.setId(KityMinder.uuid('node_progress'));
            this.translate(0.5, 0.5);
        },

        setSize: function(size) {
            this.width = this.height = size;
        },

        create: function() {

            var bg, pie, shadow, frame, check;

            bg = new kity.Circle(9)
                .fill(BG_COLOR);

            pie = new kity.Pie(9, 0)
                .fill(PIE_COLOR);

            shadow = new kity.Path()
                .setPathData(SHADOW_PATH)
                .setTranslate(-10, -10)
                .fill(SHADOW_COLOR);

            frame = new kity.Path()
                .setTranslate(-10, -10)
                .setPathData(FRAME_PATH)
                .fill(FRAME_GRAD);

            check = new kity.Path()
                .setTranslate(-10, -10)
                .setPathData(CHECK_PATH)
                .fill(CHECK_COLOR);

            this.addShapes([bg, pie, shadow, check, frame]);
            this.pie = pie;
            this.check = check;
        },

        setValue: function(value) {
            this.pie.setAngle(-360 * (value - 1) / 8);
            this.check.setVisible(value == 9);
        }
    });

    var ProgressCommand = kity.createClass('ProgressCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData(PROGRESS_DATA, value || null).render();
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
            return val|| null;
        },

        queryState: function(km) {
            return km.getSelectedNodes().length ? 0 : -1;
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

                    return new kity.Box(x, y, icon.width, icon.height);
                }
            })
        }
    };
});