KityMinder.registerModule( "hyperlink", function () {
    //var linkShapePath = "M 39.00,36.00l-3.00,0.00 c-3.915,0.00-7.206-2.511-8.448-6.00L39.00,30.00 c 1.659,0.00, 3.00-1.341, 3.00-3.00L42.00,21.00 c0.00-1.659-1.341-3.00-3.00-3.00L27.552,18.00 C 28.794,14.514, 32.085,12.00, 36.00,12.00l3.00,0.00 c 4.968,0.00, 9.00,4.029, 9.00,9.00l0.00,6.00 C 48.00,31.971, 43.968,36.00, 39.00,36.00z M 12.00,24.00 c0.00-1.659, 1.344-3.00, 3.00-3.00l18.00,0.00 c 1.659,0.00, 3.00,1.341, 3.00,3.00s-1.341,3.00-3.00,3.00L15.00,27.00 C 13.344,27.00, 12.00,25.659, 12.00,24.00z M 6.00,21.00l0.00,6.00 c0.00,1.659, 1.344,3.00, 3.00,3.00l11.448,0.00 C 19.209,33.489, 15.912,36.00, 12.00,36.00L9.00,36.00 c-4.971,0.00-9.00-4.029-9.00-9.00L0.00,21.00 c0.00-4.971, 4.029-9.00, 9.00-9.00l3.00,0.00 c 3.912,0.00, 7.209,2.514, 8.448,6.00L9.00,18.00 C 7.344,18.00, 6.00,19.341, 6.00,21.00z";
    var linkShapePath = "M16.614,10.224h-1.278c-1.668,0-3.07-1.07-3.599-2.556h4.877c0.707,0,1.278-0.571,1.278-1.278V3.834 c0-0.707-0.571-1.278-1.278-1.278h-4.877C12.266,1.071,13.668,0,15.336,0h1.278c2.116,0,3.834,1.716,3.834,3.834V6.39 C20.448,8.508,18.73,10.224,16.614,10.224z M5.112,5.112c0-0.707,0.573-1.278,1.278-1.278h7.668c0.707,0,1.278,0.571,1.278,1.278 S14.765,6.39,14.058,6.39H6.39C5.685,6.39,5.112,5.819,5.112,5.112z M2.556,3.834V6.39c0,0.707,0.573,1.278,1.278,1.278h4.877 c-0.528,1.486-1.932,2.556-3.599,2.556H3.834C1.716,10.224,0,8.508,0,6.39V3.834C0,1.716,1.716,0,3.834,0h1.278 c1.667,0,3.071,1.071,3.599,2.556H3.834C3.129,2.556,2.556,3.127,2.556,3.834z";
    return {
        "commands": {
            "hyperlink": kity.createClass( "hyperlink", {
                base: Command,

                execute: function ( km, url ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink', url );
                        km.updateLayout( n )
                    } )

                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if ( nodes.length == 0 ) {
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
                        km.updateLayout( n )
                    } )
                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes();

                    if ( nodes.length == 0 ) {
                        return -1;
                    }
                    var link = false;
                    utils.each( nodes, function ( i, n ) {
                        if(n.getData( 'hyperlink' )){
                            link = true;
                            return false;
                        }
                    } );
                    if(link){
                        return 0
                    }
                    return -1;
                }
            } )
        },
        "events": {
            "RenderNodeRight": function ( e ) {
                var node = e.node,
                    url;
                if ( url = node.getData( 'hyperlink' ) ) {
                    var link = new kity.HyperLink( url );
                    var linkshape = new kity.Path();
                    var box = node.getContRc().getBoundaryBox();
                    var style = this.getCurrentLayoutStyle()[ node.getType() ];
                    linkshape.setPathData( linkShapePath ).fill( '#666' ).setTranslate( box.x + box.width + style.spaceLeft, -5 );
                    link.addShape( linkshape );
                    link.setTarget( '_blank' );
                    link.setStyle( 'cursor', 'pointer' );
                    node.getContRc().addShape( link );

                }
            }
        }
    };
} );