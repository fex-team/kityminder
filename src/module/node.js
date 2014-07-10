var AppendChildCommand = kity.createClass('AppendChildCommand', {
    base: Command,
    execute: function(km, text) {
        var parent = km.getSelectedNode();
        if (!parent) {
            return null;
        }
        parent.expand();
        var node = km.createNode(text, parent);
        km.select(node, true);
        node.render();
        node._lastLayoutTransform = parent._lastLayoutTransform;
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var AppendSiblingCommand = kity.createClass('AppendSiblingCommand', {
    base: Command,
    execute: function(km, text) {
        var sibling = km.getSelectedNode();
        var parent = sibling.parent;
        if (!parent) {
            return km.execCommand('AppendChildNode', text);
        }
        var node = km.createNode(text, parent, sibling.getIndex() + 1);
        km.select(node, true);
        node.render();
        node._lastLayoutTransform = sibling._lastLayoutTransform;
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var RemoveNodeCommand = kity.createClass('RemoverNodeCommand', {
    base: Command,
    execute: function(km, text) {
        var nodes = km.getSelectedNodes();
        var ancestor = MinderNode.getCommonAncestor.apply(null, nodes);

        nodes.forEach(function(node) {
            if (!node.isRoot()) km.removeNode(node);
        });

        km.select(ancestor || km.getRoot(), true);
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var EditNodeCommand = kity.createClass('EditNodeCommand', {
    base: Command,
    execute: function(km) {
        var selectedNode = km.getSelectedNode();
        if (!selectedNode) {
            return null;
        }
        km.select(selectedNode, true);
        km.textEditNode(selectedNode);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        if (!selectedNode) {
            return -1;
        } else {
            return 0;
        }
    },
    isNeedUndo: function() {
        return false;
    }
});

KityMinder.registerModule('NodeModule', function() {
    return {
        commands: {
            'AppendChildNode': AppendChildCommand,
            'AppendSiblingNode': AppendSiblingCommand,
            'RemoveNode': RemoveNodeCommand,
            'EditNode': EditNodeCommand
        },
        'contextmenu': [{
            label: this.getLang('node.appendsiblingnode'),
            exec: function() {
                this.execCommand('AppendSiblingNode', this.getLang('topic'));
            },
            cmdName: 'appendsiblingnode'
        }, {
            label: this.getLang('node.appendchildnode'),
            exec: function() {
                this.execCommand('AppendChildNode', this.getLang('topic'));
            },
            cmdName: 'appendchildnode'
        }, {
            label: this.getLang('node.editnode'),
            exec: function() {
                this.execCommand('EditNode');
            },
            cmdName: 'editnode'
        }, {
            label: this.getLang('node.removenode'),
            cmdName: 'RemoveNode'
        }, {
            divider: 1
        }]
    };
});