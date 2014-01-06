KityMinder.registerModule( "MouseModule", function () {

    return {
        "events": {
            mousedown: function ( e ) {
                var clickNode = e.getTargetNode();
                var deltaNodes = this.getSelectedNodes();
                this.selectSingle( clickNode );
                if ( clickNode ) {
                    deltaNodes.push( clickNode );
                }
                this.execCommand( 'rendernode', deltaNodes );
            }
        }
    };
} );