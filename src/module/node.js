var AppendChildCommand = kity.createClass('AppendChildCommand', {
    base: Command,
    execute: function(km, text) {
        var parent = km.getSelectedNode();
        if (!parent) {
            return null;
        }
        text = text || km.getLang('topic');
        parent.expand();
        var node = km.createNode(text, parent);
        km.select(node, true);
        node.render();
        km.layout(600);
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
        text = text || km.getLang('topic');
        var node = km.createNode(text, parent, sibling.getIndex() + 1);
        km.select(node, true);
        node.render();
        km.layout(600);
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
        km.layout(600);
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
            command: 'appendsiblingnode'
        }, {
            command: 'appendchildnode'
        }, {
            command: 'editnode'
        }, {
            command: 'removenode'
        }, {
            divider: 1
        }],

        'commandShortcutKeys': {
            'appendsiblingnode': 'normal::Enter',
            'appendchildnode': 'normal::Insert|Tab',
            'editnode': 'normal::F2',
            'removenode': 'normal::Del|Backspace'
        }
    };
});