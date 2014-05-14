KityMinder.registerModule( "hyperlink", function () {
    var linkShapePath = "M16.614,10.224h-1.278c-1.668,0-3.07-1.07-3.599-2.556h4.877c0.707,0,1.278-0.571,1.278-1.278V3.834 c0-0.707-0.571-1.278-1.278-1.278h-4.877C12.266,1.071,13.668,0,15.336,0h1.278c2.116,0,3.834,1.716,3.834,3.834V6.39 C20.448,8.508,18.73,10.224,16.614,10.224z M5.112,5.112c0-0.707,0.573-1.278,1.278-1.278h7.668c0.707,0,1.278,0.571,1.278,1.278 S14.765,6.39,14.058,6.39H6.39C5.685,6.39,5.112,5.819,5.112,5.112z M2.556,3.834V6.39c0,0.707,0.573,1.278,1.278,1.278h4.877 c-0.528,1.486-1.932,2.556-3.599,2.556H3.834C1.716,10.224,0,8.508,0,6.39V3.834C0,1.716,1.716,0,3.834,0h1.278 c1.667,0,3.071,1.071,3.599,2.556H3.834C3.129,2.556,2.556,3.127,2.556,3.834z";
    return {
        "commands": {
            "hyperlink": kity.createClass( "hyperlink", {
                base: Command,

                execute: function ( km, url ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink', url );
                        km.updateLayout( n );
                    } );

                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if ( nodes.length === 0 ) {
                        return -1;
                    }
                    utils.each( nodes, function ( i, n ) {
                        if ( n && n.getData( 'hyperlink' ) ) {
                            result = 0;
                            return false;
                        }
                    } );
                    return result;
                },
                queryValue: function ( km ) {
                    var node = km.getSelectedNode();
                    return node.getData( 'hyperlink' );
                }
            } ),
            "unhyperlink": kity.createClass( "hyperlink", {
                base: Command,

                execute: function ( km ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink' );
                        km.updateLayout( n );
                    } );
                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes();

                    if ( nodes.length === 0 ) {
                        return -1;
                    }
                    var link = false;
                    utils.each( nodes, function ( i, n ) {
                        if ( n.getData( 'hyperlink' ) ) {
                            link = true;
                            return false;
                        }
                    } );
                    if ( link ) {
                        return 0;
                    }
                    return -1;
                }
            } )
        },
        "events": {
            "RenderNodeRight": function ( e ) {
                var node = e.node,
                    url = node.getData( 'hyperlink' );
                if ( url ) {
                    var link = new kity.HyperLink( url );
                    var linkshape = new kity.Path();
                    var outline = new kity.Rect(24, 22, -2, -6, 4).fill('rgba(255, 255, 255, 0)');
                    var box = node.getContRc().getBoundaryBox();
                    var style = this.getCurrentLayoutStyle()[ node.getType() ];

                    linkshape.setPathData( linkShapePath ).fill( '#666' );
                    link.setAttr('xlink:title', url);
                    link.addShape( outline );
                    link.addShape( linkshape );
                    link.setTarget( '_blank' );
                    link.setStyle( 'cursor', 'pointer' );
                    node.getContRc().addShape( link.setTranslate( box.x + box.width + style.spaceLeft + 5, -5 ) );

                    link.on('mouseover', function() {
                        outline.fill('rgba(255, 255, 200, .8)');
                    }).on('mouseout', function() {
                        outline.fill('rgba(255, 255, 255, 0)');
                    });

                }
            }
        }
    };
} );