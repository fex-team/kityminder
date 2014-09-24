KityMinder.registerModule("fontmodule", function() {
    function getNodeDataOrStyle(node, name) {
        return node.getData(name) || node.getStyle(name);
    }

    KityMinder.TextRenderer.registerStyleHook(function(node, textGroup) {
        var dataColor = node.getData('color');
        var selectedColor = node.getStyle('selected-color');
        var styleColor = node.getStyle('color');

        var foreColor = dataColor || (node.isSelected() && selectedColor ? selectedColor : styleColor);
        var fontFamily = getNodeDataOrStyle(node, 'font-family');
        var fontSize = getNodeDataOrStyle(node, 'font-size');
        var fontHash = [fontFamily, fontSize].join('/');

        if (foreColor.toString() != node.getTmpData('fore-color')) {
            textGroup.fill(foreColor);
            node.setTmpData('fore-color', foreColor.toString());
        }

        textGroup.eachItem(function(index,item){
            item.setFont({
                'family': fontFamily,
                'size': fontSize
            });
        });
        node.setTmpData('font-hash', fontHash);
    });

    return {
        defaultOptions: {
            'fontfamily': [{
                name: '宋体',
                val: '宋体,SimSun'
            }, {
                name: '微软雅黑',
                val: '微软雅黑,Microsoft YaHei'
            }, {
                name: '楷体',
                val: '楷体,楷体_GB2312,SimKai'
            }, {
                name: '黑体',
                val: '黑体, SimHei'
            }, {
                name: '隶书',
                val: '隶书, SimLi'
            }, {
                name: 'Andale Mono',
                val: 'andale mono'
            }, {
                name: 'Arial',
                val: 'arial,helvetica,sans-serif'
            }, {
                name: 'arialBlack',
                val: 'arial black,avant garde'
            }, {
                name: 'Comic Sans Ms',
                val: 'comic sans ms'
            }, {
                name: 'Impact',
                val: 'impact,chicago'
            }, {
                name: 'Times New Roman',
                val: 'times new roman'
            }, {
                name: 'Sans-Serif',
                val: 'sans-serif'
            }],
            'fontsize': [10, 12, 16, 18, 24, 32, 48]
        },
        "commands": {
            "forecolor": kity.createClass("fontcolorCommand", {
                base: Command,

                execute: function(km, color) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('color', color);
                        n.render();
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function(km) {
                    if (km.getSelectedNodes().length == 1) {
                        return km.getSelectedNodes()[0].getData('color');
                    }
                    return 'mixed';
                }

            }),
            "background": kity.createClass("backgroudCommand", {
                base: Command,

                execute: function(km, color) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('background', color);
                        n.render();
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function(km) {
                    if (km.getSelectedNodes().length == 1) {
                        return km.getSelectedNodes()[0].getData('background');
                    }
                    return 'mixed';
                }

            }),
            "fontfamily": kity.createClass("fontfamilyCommand", {
                base: Command,

                execute: function(km, family) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('font-family', family);
                        n.render();
                        km.layout();
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length === 0 ? -1 : 0
                },
                queryValue: function(km) {
                    var node = km.getSelectedNode();
                    if (node) return node.getData('font-family');
                    return null;
                }
            }),
            "fontsize": kity.createClass("fontsizeCommand", {
                base: Command,

                execute: function(km, size) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('font-size', size);
                        n.render();
                        km.layout(300);
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function(km) {
                    var node = km.getSelectedNode();
                    if (node) return node.getData('font-size');
                    return null;
                }
            })
        }
    };
});