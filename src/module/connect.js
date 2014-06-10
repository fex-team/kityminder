/* global Renderer: true */

kity.extendClass(Minder, {

    createConnect: function(node) {
        if (node.isRoot()) return;

        var strokeColor = node.getStyle('connect-color') || 'white',
            strokeWidth = node.getStyle('connect-width') || 2;

        var connection = new kity.Path()
            .stroke(strokeColor, strokeWidth);

        node._connection = connection;

        this.getRenderContainer().prependShape(connection);
    },

    removeConnect: function(node) {
        var me = this;
        node.traverse(function(node) {
            me.getRenderContainer().removeShape(node._connection);
        });
    },

    updateConnect: function(node) {

        var connection = node._connection;
        var parent = node.parent;

        if (!parent) return;

        var box = node.getLayoutBox(),
            pBox = parent.getLayoutBox();

        var start, end, vector;
        var abs = Math.abs;
        var pathData = [];

        var side = box.cx > pBox.cx ? 'right' : 'left';

        if (parent.isCollapsed()) {
            connection.setVisible(false);
            return;
        }
        connection.setVisible(true);

        switch (node.getType()) {

            case 'main':

                start = new kity.Point(pBox.cx, pBox.cy);
                end = side == 'left' ?
                    new kity.Point(box.right, box.cy) :
                    new kity.Point(box.left, box.cy);
                vector = kity.Vector.fromPoints(start, end);
                pathData.push('M', start);
                pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);
                break;

            case 'sub':

                var radius = node.getStyle('connect-radius');

                if (side == 'right') {
                    start = new kity.Point(box.left - node.getStyle('margin-left') / 2, pBox.cy);
                    end = new kity.Point(box.right + node.getStyle('margin-right') / 2, box.bottom);
                } else {
                    start = new kity.Point(box.right + node.getStyle('margin-right') / 2, pBox.cy);
                    end = new kity.Point(box.left - node.getStyle('margin-left') / 2, box.bottom);
                }

                end.y += 1;

                var isTop = parent.children.length > 1 && node.getIndex() === 0;

                pathData.push('M', start);
                pathData.push('L', start.x, isTop ? (end.y + radius) : (end.y - radius));

                var sf = +(side == 'right' && isTop || side == 'left' && !isTop);
                var ex = side == 'right' ? (start.x + radius) : (start.x - radius);

                pathData.push('A', radius, radius, 0, 0, sf, ex, end.y);
                pathData.push('L', end);
        }

        connection.setPathData(pathData);
    }
});

KityMinder.registerModule('Connect', {
    events: {
        'nodecreate': function(e) {
            this.createConnect(e.node);
        },
        'noderemove': function(e) {
            this.removeConnect(e.node);
        },
        'layoutapply noderender': function(e) {
            this.updateConnect(e.node);
        }
    }
});