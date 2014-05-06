KityMinder.registerModule( "hyperlink", function () {

	return {
		"commands": {
			"hyperlink" : kity.createClass( "hyperlink", {
                base: Command,

                execute: function (km,url) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink', url );
                        km.updateLayout(n)
                    } )

                },
                queryState: function (km) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if ( nodes.length == 0 ) {
                        return -1;
                    }
                    utils.each( nodes, function ( i, n ) {
                        if ( n && n.getData( 'hyperlink' ) ) {
                            result = 1;
                            return false;
                        }
                    } );
                    return result;
                },
                queryValue : function (km) {
                    if ( km.queryCommandState( 'hyperlink' ) == 1 ) {
                        var node = km.getSelectedNode();
                        return node.getData( 'hyperlink' );
                    }
                }
            } ),
            "unhyperlink" : kity.createClass( "hyperlink", {
                base: Command,

                execute: function (km) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink' );
                        km.updateLayout(n)
                    } )
                }
            } )
		},
		"events": {
			"RenderNodeRight": function ( e ) {
		        var node = e.node,url;
                if(url = node.getData('hyperlink')){
                    var link = new kity.HyperLink(url);
                    var rect = new kity.Rect();
                    var box = node.getContRc().getBoundaryBox();
                    var style = this.getCurrentLayoutStyle()[ node.getType() ];
                    rect.setWidth(10).setHeight(10).fill('#ccc').setPosition(box.x + box.width + style.spaceLeft,rect.getHeight()/-2);
                    link.addShape(rect);
                    link.setTarget('_blank');
                    link.setStyle('cursor','pointer');
                    node.getContRc().addShape(link);

                }
			}
		}
	};
} );