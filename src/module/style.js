KityMinder.registerModule('StyleModule', function() {
    var styleNames = ['font-size', 'font-family', 'font-weight', 'font-style', 'background', 'color'];
    var styleClipBoard = null;

    function hasStyle(node) {
        var data = node.getData();
        for(var i = 0; i < styleNames.length; i++) {
            if (styleNames[i] in data) return true;
        }
    }

    return {
        "commands": {
            "copystyle": kity.createClass("CopyStyleCommand", {
                base: Command,

                execute: function(minder) {
                    var node = minder.getSelectedNode();
                    var nodeData = node.getData();
                    styleClipBoard = {};
                    styleNames.forEach(function(name) {
                        if (name in nodeData) styleClipBoard[name] = nodeData[name];
                        else {
                            styleClipBoard[name] = null;
                            delete styleClipBoard[name];
                        }
                    });
                    return styleClipBoard;
                },

                queryState: function(minder) {
                    var nodes = minder.getSelectedNodes();
                    if (nodes.length !== 1) return -1;
                    return hasStyle(nodes[0]) ? 0 : -1;
                }
            }),

            "pastestyle": kity.createClass("PastStyleCommand", {
                base: Command,

                execute: function(minder) {
                    minder.getSelectedNodes().forEach(function(node) {
                        for (var name in styleClipBoard) {
                            if (styleClipBoard.hasOwnProperty(name))
                                node.setData(name, styleClipBoard[name]);
                        }
                    });
                    minder.renderNodeBatch(minder.getSelectedNodes());
                    minder.layout(300);
                    return styleClipBoard;
                },

                queryState: function(minder) {
                    return (styleClipBoard && minder.getSelectedNodes().length) ? 0 : -1;
                }
            }),

            "clearstyle": kity.createClass("ClearStyleCommand", {
                base: Command,
                execute: function(minder) {
                    minder.getSelectedNodes().forEach(function(node) {
                        styleNames.forEach(function(name) {
                            node.setData(name);
                        });
                    });
                    minder.renderNodeBatch(minder.getSelectedNodes());
                    minder.layout(300);
                    return styleClipBoard;
                },

                queryState: function(minder) {
                    var nodes = minder.getSelectedNodes();
                    if (!nodes.length) return -1;
                    for(var i = 0; i < nodes.length; i++) {
                        if (hasStyle(nodes[i])) return 0;
                    }
                    return -1;
                }
            })
        }
    };
});