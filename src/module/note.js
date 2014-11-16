/**
 * @fileOverview
 *
 * 支持节点详细信息（HTML）格式
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerModule('NoteModule', function() {

    var NOTE_PATH = 'M9,9H3V8h6L9,9L9,9z M9,7H3V6h6V7z M9,5H3V4h6V5z M8.5,11H2V2h8v7.5 M9,12l2-2V1H1v11';

    var NoteCommand = kity.createClass('NoteCommand', {
        base: Command,

        execute: function(minder, note) {
            var node = minder.getSelectedNode();
            node.setData('note', note);
            node.render();
            node.getMinder().layout(300);
        },

        queryState: function(minder) {
            return minder.getSelectedNodes().length === 1 ? 0 : -1;
        },

        queryValue: function(minder) {
            var node = minder.getSelectedNode();
            return node && node.getData('note');
        }
    });

    var NoteIcon = kity.createClass('NoteIcon', {
        base: kity.Group,

        constructor: function() {
            this.callBase();
            this.width = 16;
            this.height = 17;
            this.rect = new kity.Rect(16, 17, 0.5, -8.5, 2).fill('transparent');
            this.path = new kity.Path().setPathData(NOTE_PATH).setTranslate(2.5, -6.5);
            this.addShapes([this.rect, this.path]);

            this.on('mouseover', function() {
                this.rect.fill('rgba(255, 255, 200, .8)');
            }).on('mouseout', function() {
                this.rect.fill('transparent');
            });

            this.setStyle('cursor', 'pointer');
        }
    });

    var NoteIconRenderer = kity.createClass('NoteIconRenderer', {
        base: KityMinder.Renderer,

        create: function(node) {
            var icon = new NoteIcon();
            icon.on('mousedown', function(e) {
                e.preventDefault();
                node.getMinder().fire('editnoterequest');
            });
            icon.on('mouseover', function() {
                node.getMinder().fire('shownoterequest', {node: node, icon: icon});
            });
            icon.on('mouseout', function() {
                node.getMinder().fire('hidenoterequest', {node: node, icon: icon});
            });
            return icon;
        },

        shouldRender: function(node) {
            return node.getData('note');
        },

        update: function(icon, node, box) {
            var x = box.right + node.getStyle('space-left');
            var y = box.cy;

            icon.path.fill(node.getStyle('color'));
            icon.setTranslate(x, y);

            return new kity.Box(x, Math.round(y - icon.height / 2), icon.width, icon.height);
        }

    });

    return {
        renderers: {
            right: NoteIconRenderer
        },
        commands: {
            'note': NoteCommand
        }
    };
});