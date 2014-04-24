KityMinder.registerModule( "hyperlink", function () {

	return {
		"commands": {
			"createlink" : kity.createClass( "hyperlink", {
                base: Command,

                execute: function (url) {

                    var nodes = km.getSelectedNodes();
                    if ( this.queryState( 'hyperlink' ) == 1 ) {
                        utils.each( nodes, function ( i, n ) {
                            n.setData( 'hyperlink' );

                        } )
                    } else {
                        utils.each( nodes, function ( i, n ) {
                            n.setData( 'hyperlink', url );
                        } )
                    }
                },
                queryState: function () {
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
                }
            } )
		},
		"events": {
			"RenderNodeRight": function ( e ) {
		        var node = e.node,url;
                if(url = node.getData('h')){
                    var link = new kity.HyperLink(url);
                    var rect = new kity.Rect();
                    var box = node.getContRc().getBoundaryBox();
                    rect.setWidth(10).setHeight(10).fill('#ccc').setPosition(box.x + box.width + 2,rect.getHeight()/-2);
                    link.appendChild(rect);
                    node.getContRc().appendChild(link);

                }
			}
		}
	};
} );