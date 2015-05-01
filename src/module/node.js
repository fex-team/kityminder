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
        }
        else {
            return 0;
        }
    },
    isNeedUndo: function() {
        return false;
    }
});

var $importDialog;
var $exportDialog;

var ImportTextNode = kity.createClass('ImportTextNode', {
    base: Command,
    execute: function(km, text) {
        if (!$importDialog) {
            var plainProtocol = km.getProtocol('plain');

            var height = 400;
            $importDialog = new FUI.Dialog({
                width: 600,
                height: height,
                prompt: true,
                caption: km.getLang('ui.importtextnode')
            }).appendTo(document.getElementById('content-wrapper'));

            var $dialogBody = $($importDialog.getBodyElement());

            $dialogBody.html([
                '<textarea style="width: 100%; height: ' + (height - 130) + 'px"></textarea>'
            ].join(''));

            var $editor = $dialogBody.find('textarea');
            var $ok = $importDialog.getButton(0);
            var $errorMsg = $('<span class="validate-error"></span>');
            var rootNode;

            function check(value) {
                var error;
                if (!value) {
                    error = '内容不能为空';
                }
                else {
                    try {
                        rootNode = plainProtocol.decode(value, true);
                    }
                    catch (ex) {
                        error = '文本格式解析错误. ' + ex.message;
                    }
                }

                if (error) {
                    $editor.addClass('validate-error');
                    $errorMsg.text(error);
                    $ok.disable();
                }
                else {
                    $editor.removeClass('validate-error');
                    $errorMsg.text('');
                    $ok.enable();
                }
            }

            $editor.after($errorMsg);

            $editor.on('input', function() {
                check($editor.val());
            });
            $editor.on('keydown keyup', function(e) {
                if (e.keyCode === 9 && e.type === 'keydown') {
                    e.preventDefault();
                    var s = this.selectionStart;
                    this.value = this.value.substring(0, this.selectionStart) + '\t' +
                        this.value.substring(this.selectionEnd);
                    this.selectionEnd = s + 1;
                }
                if (e.keyCode === 13 && !e.shiftKey) {
                    return;
                }
                e.stopPropagation();
            });
            $importDialog.on('open', function() {
                check($editor.val());
                setTimeout(function() {
                    $editor[0].focus();
                }, 10);
            });
            $importDialog.on('ok', function() {
                var _selectedNodes = [];

                function appendChild(parent, child, index) {
                    if (!parent || !child) {
                        return;
                    }
                    var kmNode = km.createNode(child.data.text, parent);
                    if (child.children) {
                        child.children.forEach(function(item) {
                            appendChild(kmNode, item);
                        });
                    }
                    kmNode.render();
                    return kmNode;
                }

                var selectedNode = km.getSelectedNode();
                if (rootNode && rootNode.children && selectedNode) {
                    selectedNode.expand();
                    rootNode.children.forEach(function(child) {
                        _selectedNodes.push(appendChild(selectedNode, child));
                    });
                }
                km.select(_selectedNodes, true);
                km.layout(300);

                $editor.val('');
                _selectedNodes = null;
                rootNode = null;
            });
        }
        $importDialog.open();
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var ExportTextNode = kity.createClass('ExportTextNode', {
    base: Command,
    execute: function(km, text) {
        if (!$exportDialog) {
            var plainProtocol = km.getProtocol('plain');

            var height = 400;
            $exportDialog = new FUI.Dialog({
                width: 600,
                height: height,
                prompt: true,
                caption: km.getLang('ui.exporttextnode')
            }).appendTo(document.getElementById('content-wrapper'));

            var $dialogBody = $($exportDialog.getBodyElement());

            $dialogBody.html([
                '<textarea style="width: 100%; height: ' + (height - 130) + 'px"></textarea>'
            ].join(''));

            var $editor = $dialogBody.find('textarea');

            $editor.on('keydown keyup', function(e) {
                if (e.keyCode === 9 && e.type === 'keydown') {
                    e.preventDefault();
                    var s = this.selectionStart;
                    this.value = this.value.substring(0, this.selectionStart) + '\t' +
                        this.value.substring(this.selectionEnd);
                    this.selectionEnd = s + 1;
                }
                if (e.keyCode === 13 && !e.shiftKey) {
                    return;
                }
                e.stopPropagation();
            });

            $exportDialog.on('open', function() {
                $editor.val(plainProtocol.encode(km.getSelectedNode()));
                setTimeout(function() {
                    $editor[0].focus();
                }, 10);
            });
        }
        $exportDialog.open();
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
            'ImportTextNode': ImportTextNode,
            'ExportTextNode': ExportTextNode,
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
            command: 'importtextnode'
        }, {
            command: 'exporttextnode'
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
