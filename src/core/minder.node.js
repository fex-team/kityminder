kity.extendClass( Minder, {

    getRoot: function () {
        return this._root;
    },

    handelNodeInsert: function ( node ) {
        var rc = this._rc;
        node.traverse( function ( current ) {
            rc.addShape( current.getRenderContainer() );
        } );
    },

    handelNodeRemove: function ( node ) {
        var rc = this._rc;
        node.traverse( function ( current ) {
            rc.removeShape( current.getRenderContainer() );
        } );
    },

    update: function ( node ) {
        return this;
    }

} );