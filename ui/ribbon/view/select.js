/**
 * @fileOverview
 *
 * 节点选择功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/view/select', function(minder) {

    var $tabs = minder.getUI('ribbon/tabs');

    var $selectPanel = new FUI.LabelPanel({
        label: minder.getLang('panels.level'),
        column: true
    }).appendTo($tabs.view);

    var $selectButtonMenu = new FUI.ButtonMenu({
        id: 'select-button-menu',
        text: minder.getLang('ui.select'),
        layout: 'bottom',
        buttons: [{}, {
            label: minder.getLang('ui.selectall')
        }],
        menu: {
            items: ['revert', 'siblings', 'level', 'path', 'tree'].map(function(mode) {
                return {
                    label: minder.getLang('ui.select' + mode),
                    value: mode
                };
            })
        }
    }).appendTo($selectPanel);

    var select = {
        all: function() {
            var selection = [];
            minder.getRoot().traverse(function(node) {
                selection.push(node);
            });
            minder.select(selection, true);
        },
        revert: function() {
            var selected = minder.getSelectedNodes();
            var selection = [];
            minder.getRoot().traverse(function(node) {
                if (selected.indexOf(node) == -1) {
                    selection.push(node);
                }
            });
            minder.select(selection, true);
        },
        siblings: function() {
            var selected = minder.getSelectedNodes();
            var selection = [];
            selected.forEach(function(node) {
                if (!node.parent) return;
                node.parent.children.forEach(function(sibling) {
                    if (selection.indexOf(sibling) == -1) selection.push(sibling);
                });
            });
            minder.select(selection, true);
        },
        level: function() {
            var selectedLevel = minder.getSelectedNodes().map(function(node) {
                return node.getLevel();
            });
            var selection = [];
            minder.getRoot().traverse(function(node) {
                if (selectedLevel.indexOf(node.getLevel()) != -1) {
                    selection.push(node);
                }
            });
            minder.select(selection, true);
        },
        path: function() {
            var selected = minder.getSelectedNodes();
            var selection = [];
            selected.forEach(function(node) {
                while(node && selection.indexOf(node) == -1) {
                    selection.push(node);
                    node = node.parent;
                }
            });
            minder.select(selection, true);
        },
        tree: function() {
            var selected = minder.getSelectedNodes();
            var selection = [];
            selected.forEach(function(parent) {
                parent.traverse(function(node) {
                    if (selection.indexOf(node) == -1) selection.push(node);
                });
            });
            minder.select(selection, true);
        }
    };

    $selectButtonMenu.on('buttonclick', select.all);
    $selectButtonMenu.on('select', function(e, info) {
        select[info.value]();
    });
});