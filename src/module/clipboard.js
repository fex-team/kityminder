KityMinder.registerModule( "ClipboardModule", function () {
    var km = this,

        _clipboardNodes = [],

        _selectedNodes = [];

    function appendChildNode(parent, child) {
        _selectedNodes.push(child);
        km.appendNode(child, parent);
        child.render();
        child.setLayoutOffset(null);
        var children = utils.cloneArr(child.children);
        for (var i = 0, ci; (ci = children[i]); i++) {
            appendChildNode(child, ci);
        }
    }

    function sendToClipboard(nodes) {
        if (!nodes.length) return;
        _clipboardNodes = nodes.map(function(node) {
            return node.clone();
        });
    }

    var CopyCommand = kity.createClass('CopyCommand', {
        base: Command,

        execute: function(km) {
            sendToClipboard(km.getSelectedAncestors(true));
            this.setContentChanged(false);
        }
    });

    var CutCommand = kity.createClass('CutCommand', {
        base: Command,

        execute: function(km) {
            var ancestors = km.getSelectedAncestors();

            if (ancestors.length === 0) return;

            sendToClipboard(ancestors);

            km.select(MinderNode.getCommonAncestor(ancestors), true);

            ancestors.slice().forEach(function(node) {
                km.removeNode(node);
            });

            km.layout(300);
        }
    });

    var PasteCommand = kity.createClass('PasteCommand', {
        base: Command,

        execute: function(km) {
            if (_clipboardNodes.length) {
                var node = km.getSelectedNode();
                if (!node) return;

                for(var i= 0, ni; (ni = _clipboardNodes[i]); i++) {
                    appendChildNode(node, ni.clone());
                }

                km.select(_selectedNodes, true);
                _selectedNodes = [];

                km.layout(300);
            }
        },

        queryState: function(km) {
            return km.getSelectedNode() ? 0 : -1;
        }
    });

    return {
        'commands': {
            'copy': CopyCommand,
            'cut': CutCommand,
            'paste': PasteCommand
        },
        'commandShortcutKeys': {
            'copy': 'normal::ctrl+c|',
            'cut': 'normal::ctrl+x',
            'paste': 'normal::ctrl+v'
        }
    };
} );