KityMinder.registerModule("fontmodule", function() {
    function getNodeDataOrStyle(node, name) {
        return node.getData(name) || node.getStyle(name);
    }

    KityMinder.TextRenderer.registerStyleHook(function(node, text) {
        text.fill(getNodeDataOrStyle(node, 'color'));
        text.setFont({
            family: getNodeDataOrStyle(node, 'font-family'),
            size: getNodeDataOrStyle(node, 'font-size')
        });
    });

    return {
        defaultOptions: {
            'fontfamily': [{
                name: 'songti',
                val: '宋体,SimSun'
            }, {
                name: 'yahei',
                val: '微软雅黑,Microsoft YaHei'
            }, {
                name: 'kaiti',
                val: '楷体,楷体_GB2312, SimKai'
            }, {
                name: 'heiti',
                val: '黑体, SimHei'
            }, {
                name: 'lishu',
                val: '隶书, SimLi'
            }, {
                name: 'andaleMono',
                val: 'andale mono'
            }, {
                name: 'arial',
                val: 'arial, helvetica,sans-serif'
            }, {
                name: 'arialBlack',
                val: 'arial black,avant garde'
            }, {
                name: 'comicSansMs',
                val: 'comic sans ms'
            }, {
                name: 'impact',
                val: 'impact,chicago'
            }, {
                name: 'timesNewRoman',
                val: 'times new roman'
            }, {
                name: 'sans-serif',
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
            "backgroundcolor": kity.createClass("backgroudcolorCommand", {
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
                    return km.getSelectedNodes().length == 0 ? -1 : 0
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
                }
            })
        }
    };
});