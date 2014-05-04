kity.extendClass( Minder, {

    getRoot: function () {
        return this._root;
    },
    setRoot: function ( root ) {
        this._root = root;
    },
    handelNodeInsert: function ( node ) {
        var rc = this._rc;
        // node.traverse( function ( current ) {
        //     rc.addShape( current.getRenderContainer() );
        // } );
        rc.addShape( node.getRenderContainer() );
    },
    handelNodeRemove: function ( node ) {
        var rc = this._rc;
        node.traverse( function ( current ) {
            rc.removeShape( current.getRenderContainer() );
        } );
    },
    renderNodes: function ( nodes ) {
        var km = this;
        if ( nodes instanceof Array ) {
            if ( nodes.length === 0 ) return false;
            for ( var i = 0; i < nodes.length; i++ ) {
                km.renderNode( nodes[ i ] );
            }
        } else {
            km.renderNode( nodes );
        }
    },
    getMinderTitle: function () {
        return this.getRoot().getText();
    }

} );