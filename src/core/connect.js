/* global Renderer: true */

utils.extend(KityMinder, {
    _connectProviders: {},

    _defaultConnectProvider: function(node, parent) {
        return [
            'M', parent.getLayoutPoint(),
            'L', node.getLayoutPoint()
        ];
    },

    registerConnectProvider: function(layout, provider) {
        KityMinder._connectProviders[layout] = provider;
    },

    getConnectProvider: function(layout) {
        return KityMinder._connectProviders[layout] || KityMinder._defaultConnectProvider;
    }
});

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

        if (parent.isCollapsed()) {
            connection.setVisible(false);
            return;
        }
        connection.setVisible(true);

        var provider = KityMinder.getConnectProvider(node.getLayout());
        var pathData = provider(node, parent);

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