var MinderNode = KityMinder.MinderNode = kity.createClass( "MinderNode", {
    constructor: function ( treeNotifyHandler ) {
        this.parent = null;
        this.children = [];
        this.data = {};
        this.tnh = treeNotifyHandler;
        this.rc = new kity.Group();
        this.rc.minderNode = this;
    },

    getParent: function () {
        return this.parent;
    },

    getRoot: function () {
        var root = this;
        while ( root.parent ) {
            root = root.parent;
        }
        return root;
    },

    preTraverse: function ( fn ) {
        var children = this.getChildren();
        fn( this );
        for ( var i = 0; i < children.length; i++ ) {
            children[ i ].preTraverse( fn );
        }
    },

    postTraverse: function ( fn ) {
        var children = this.getChildren();
        for ( var i = 0; i < children.length; i++ ) {
            children[ i ].postTraverse( fn );
        }
        fn( this );
    },

    traverse: function ( fn ) {
        return this.postTraverse( fn );
    },

    getChildren: function () {
        return this.children;
    },

    getIndex: function () {
        return this.parent ? this.parent.indexOf( this ) : -1;
    },

    insertChild: function ( node, index ) {
        if ( index === undefined ) {
            index = this.children.length;
        }
        if ( node.parent ) {
            node.parent.removeChild( node );
        }
        node.parent = this;
        this.children.splice( index, 0, node );
        this.handelInsert( node );
    },

    handelInsert: function ( node ) {
        var root = this.getRoot();
        if ( root.tnh ) {
            root.tnh.handelNodeInsert.call( root.tnh, node );
        }
    },

    appendChild: function ( node ) {
        return this.insertChild( node );
    },

    prependChild: function ( node ) {
        return this.insertChild( node, 0 );
    },

    removeChild: function ( elem ) {
        var index = elem,
            removed;
        if ( elem instanceof MinderNode ) {
            index = this.children.indexOf( elem );
        }
        if ( index >= 0 ) {
            removed = this.children.splice( index, 1 )[ 0 ];
            removed.parent = null;
            this.handelRemove( removed );
        }
    },

    handelRemove: function ( node ) {
        var root = this.getRoot();
        if ( root.tnh ) {
            root.tnh.handelNodeRemove.call( root.tnh, node );
        }
    },

    getChild: function ( index ) {
        return this.children[ index ];
    },

    getData: function ( name ) {
        if ( name === undefined ) {
            return this.data;
        }
        return this.data[ name ];
    },

    setData: function ( name, value ) {
        this.data[ name ] = value;
    },

    getRenderContainer: function () {
        return this.rc;
    }
} );