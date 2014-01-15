var MinderNode = KityMinder.MinderNode = kity.createClass( "MinderNode", {
    constructor: function ( options ) {
        this.parent = null;
        this.children = [];
        this.data = {};
        if(utils.isString(options)){
            this.setData('text',options)
        }else{
            this.setData(options);
        }
        this.rc = new kity.Group();
        this.rc.minderNode = this;
        this.root = null;
    },
    //在创建root时给定handler
    setNotifyHandler:function(treeNotifyHandler){
        this.tnh = treeNotifyHandler;
    },
    getParent: function () {
        return this.parent;
    },

    getDepth: function () {
        var depth = 0,
            p = this.parent;
        while ( p ) {
            p = p.parent;
            depth++;
        }
        return depth;
    },

    getRoot: function () {
        return this.root;
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
        return this.parent ? this.parent.children.indexOf( this ) : -1;
    },

    insertChild: function ( node, index ) {
        if ( index === undefined ) {
            index = this.children.length;
        }
        if ( node.parent ) {
            node.parent.removeChild( node );
        }
        node.parent = this;
        node.root = parent.root;

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
    getFirstChild:function(){
        return this.children[0]
    },
    getLastChild:function(){
        return this.children[this.children.length-1]
    },
    getData: function ( name ) {
        if ( name === undefined ) {
            return this.data;
        }
        return this.data[ name ];
    },

    setData: function ( name, value ) {
        if ( arguments.length == 1 && typeof ( arguments[ 0 ] ) == 'object' ) {
            Utils.extend( this.data, arguments[ 0 ] );
        }
        this.data[ name ] = value;
    },
    clearData: function () {
        this.data = {};
    },
    getRenderContainer: function () {
        return this.rc;
    },
    getCommonAncestor:function(node){
        if(this === node){
            return this.parent
        }
        if(this.contains(node)){
            return this
        }
        if(node.contains(this)){
            return node
        }
        var parent = node.parent;
        while(!parent.contains(node)){
            parent = parent.parentNode;
        }
        return parent;
    },
    contains:function(node){
        if(this === node){
            return true;
        }
        if(this === node.parent){
            return true;
        }
        var isContain = false;
        utils.each(this.getChildren(),function(i,n){
            isContain = n.contains(node);
            if(isContain === true){
                return false
            }
        });
        return isContain;

    }
} );