kity.extendClass(Minder, {
    appendChildNode: function(parent, node, index) {

    },
    appendSiblingNode: function(sibling, node) {
        var curStyle = this.getCurrentStyle();
        this.getLayoutStyle(curStyle).appendSiblingNode.call(this, sibling, node);
    },
});

var AppendChildCommand = kity.createClass('AppendChildCommand', {
    base: Command,
    execute: function(km, text) {
        var parent = km.getSelectedNode();
        var node = km.createNode(text);
        if (!parent) {
            return null;
        }
        //parent.expand();
        parent.appendChild(node);
        km.select(node, true);
        node.render();
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
        var node = km.createNode(text);
        if (!parent) {
            return null;
        }
        parent.insertChild(node, sibling.getIndex() + 1);
        km.select(node, true);
        node.render();
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
        var ancestor = km.getSelectedAncestors()[0];

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