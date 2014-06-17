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
            return null;
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
            km.removeNode(node);
        });

        km.select(ancestor, true);
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});


KityMinder.registerModule('NodeModule', function() {
    return {
        commands: {
            'AppendChildNode': AppendChildCommand,
            'AppendSiblingNode': AppendSiblingCommand,
            'RemoveNode': RemoveNodeCommand
        }
    };
});