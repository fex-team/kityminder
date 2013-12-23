kity.extendClass( KityMinder, {

    getRoot: function () {
        return this._root;
    },

    traverse: function ( node, fn ) {
        var children = node.getChildren();
        for ( var i = 0; i < children.length; i++ ) {
            this.traverse( children[ i ], fn );
        }
        fn.call( this, node );
    },

    handelNodeInsert: function ( node ) {
        this.traverse( node, function ( current ) {
            this._rc.addShape( current.getRenderContainer() );
        } );
    },

    handelNodeRemove: function ( node ) {
        this.traverse( node, function ( current ) {
            this._rc.removeShape( current.getRenderContainer() );
        } );
    },

    update: function ( node ) {
        this.execCommand( 'renderroot', node );
        return this;
    }
} );