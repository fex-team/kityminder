KityMinder.registerModule( "fontmodule", function () {

    return {
        defaultOptions: {
            'fontfamily': [ {
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
            } ],
            'fontsize': [ 10, 12, 16, 18, 24, 32, 48 ]
        },
        "commands": {
            "forecolor": kity.createClass( "fontcolorCommand", {
                base: Command,

                execute: function ( km, color ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'fontcolor', color );
                        n.getTextShape().fill( color )
                    } )
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function(km) {
                    if (km.getSelectedNodes().length == 1) {
                        return km.getSelectedNodes()[0].getData('fontcolor');
                    }
                    return 'mixed';
                }

            } ),
            "backgroundcolor": kity.createClass( "backgroudcolorCommand", {
                base: Command,

                execute: function ( km, color ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'backgroundcolor', color );
                        n.getLayout().bgRect.fill( color );
                    } );
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function (km) {
                    if (km.getSelectedNodes().length == 1) {
                        return km.getSelectedNodes()[0].getData('backgroundcolor');
                    }
                    return 'mixed';
                }

            } ),
            "fontfamily": kity.createClass( "fontfamilyCommand", {
                base: Command,

                execute: function ( km, family ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'fontfamily', family );
                        n.getTextShape().setAttr( 'font-family', family );
                        km.updateLayout( n )
                    } )
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                }
            } ),
            "fontsize": kity.createClass( "fontsizeCommand", {
                base: Command,

                execute: function ( km, size ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'fontsize', size );
                        n.getTextShape().setSize( size );
                        km.updateLayout( n )
                    } )
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                }
            } )
        },

        "events": {
            "afterrendernodecenter": function ( e ) {
                var val;
                if ( val = e.node.getData( 'fontfamily' ) ) {
                    e.node.getTextShape().setAttr( 'font-family', val );
                }
                if ( val = e.node.getData( 'fontcolor' ) ) {
                    e.node.getTextShape().fill( val );
                }
                if ( val = e.node.getData( 'backgroundcolor' ) ) {
                    e.node.getLayout().bgRect.fill( val );
                }
                if ( val = e.node.getData( 'fontsize' ) ) {
                    e.node.getTextShape().setSize( val );
                }
            }
        }
    };
} );