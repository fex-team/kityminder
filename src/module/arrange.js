kity.extendClass(MinderNode, {
    arrange: function(index) {
        var parent = this.parent;
        if (!parent) return;
        var sibling = parent.children;

        if (index < 0 || index >= sibling.length) return;
        sibling.splice(this.getIndex(), 1);
        sibling.splice(index, 0, this);
        return this;
    }
});

function asc(nodeA, nodeB) {
    return nodeA.getIndex() - nodeB.getIndex();
}
function desc(nodeA, nodeB) {
    return -asc(nodeA, nodeB);
}

function canArrange(km) {
    var selected = km.getSelectedNode();
    return selected && selected.parent && selected.parent.children.length > 1;
}

var ArrangeUpCommand = kity.createClass('ArrangeUpCommand', {
    base: Command,

    execute: function(km) {
        var nodes = km.getSelectedNodes();
        nodes.sort(asc);
        var lastIndexes = nodes.map(function(node) {
            return node.getIndex();
        });
        nodes.forEach(function(node, index) {
            node.arrange(lastIndexes[index] - 1);
        });
        km.layout(300);
    },

    queryState: function(km) {
        var selected = km.getSelectedNode();
        return selected ? 0 : -1;
    }
});

var ArrangeDownCommand = kity.createClass('ArrangeUpCommand', {
    base: Command,

    execute: function(km) {
        var nodes = km.getSelectedNodes();
        nodes.sort(desc);
        var lastIndexes = nodes.map(function(node) {
            return node.getIndex();
        });
        nodes.forEach(function(node, index) {
            node.arrange(lastIndexes[index] + 1);
        });
        km.layout(300);
    },

    queryState: function(km) {
        var selected = km.getSelectedNode();
        return selected ? 0 : -1;
    }
});

var ArrangeCommand = kity.createClass('ArrangeCommand', {
    base: Command,

    execute: function(km, nodes, index) {
        nodes = nodes && nodes.slice() || km.getSelectedNodes().slice();

        if (!nodes.length) return;

        var ancestor = MinderNode.getCommonAncestor(nodes);

        if (ancestor != nodes[0].parent) return;

        var indexed = nodes.map(function(node) {
            return {
                index: node.getIndex(),
                node: node
            };
        });

        var asc = Math.min.apply(Math, indexed.map(function(one) { return one.index; })) >= index;

        indexed.sort(function(a, b) {
            return asc ? (b.index - a.index) : (a.index - b.index);
        });

        indexed.forEach(function(one) {
            one.node.arrange(index);
        });

        km.layout(300);
    },

    queryState: function(km) {
        var selected = km.getSelectedNode();
        return selected ? 0 : -1;
    }
});

KityMinder.registerModule('ArrangeModule', {
    commands: {
        'arrangeup': ArrangeUpCommand,
        'arrangedown': ArrangeDownCommand,
        'arrange': ArrangeCommand
    },
    contextmenu: [{
        command: 'arrangeup'
    }, {
        command: 'arrangedown'
    }, {
        divider: true
    }],
    commandShortcutKeys: {
        'arrangeup': 'normal::alt+Up',
        'arrangedown': 'normal::alt+Down'
    }
});