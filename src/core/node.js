var MinderNode = KityMinder.MinderNode = kity.createClass( "MinderNode", {
    constructor: function ( options ) {
        this.parent = null;
        this.children = [];
        this.data = {};
        if ( Utils.isString( options ) ) {
            this.setData( 'text', options );
        } else {
            this.setData( options );
        }
        this.rc = new kity.Group();
        this.rc.addClass('km-minderNode');

        this.rc.minderNode = this;
    },
    setPoint: function ( x, y ) {
        this.setData( 'point', {
            x: x,
            y: y
        } );
    },
    getPoint: function () {
        return this.getData( 'point' );
    },
    setType: function ( type ) {
        this.setData( 'type', type );
    },
    getType: function ( type ) {
        return this.getData( 'type' );
    },
    setText: function ( text ) {
        this.setData( 'text', text );
    },
    getText: function () {
        return this.getData( 'text' );
    },
    isRoot: function () {
        return this.getParent() === null ? true : false;
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
            //            this.handelRemove( removed );
        }
    },

    //    handelRemove: function ( node ) {
    //        var root = this.getRoot();
    //        if ( root.tnh ) {
    //            root.tnh.handelNodeRemove.call( root.tnh, node );
    //        }
    //    },

    getChild: function ( index ) {
        return this.children[ index ];
    },
    getFirstChild: function () {
        return this.children[ 0 ];
    },
    getLastChild: function () {
        return this.children[ this.children.length - 1 ];
    },
    getData: function ( name ) {
        if ( name === undefined ) {
            return this.data;
        }
        return this.data[ name ];
    },

    setData: function ( name, value ) {
        if ( name === undefined ) {
            this.data = {};

        } else if ( utils.isObject( name ) ) {
            Utils.extend( this.data, name );
        } else {
            if ( value === undefined ) {
                this.data[ name ] = null;
                delete this.data[ name ];
            } else {
                this.data[ name ] = value;
            }
        }
    },
    getRenderContainer: function () {
        return this.rc;
    },
    getCommonAncestor: function ( node ) {
        return Utils.getNodeCommonAncestor( this, node );
    },
    contains: function ( node ) {
        if ( this === node ) {
            return true;
        }
        if ( this === node.parent ) {
            return true;
        }
        var isContain = false;
        Utils.each( this.getChildren(), function ( i, n ) {
            isContain = n.contains( node );
            if ( isContain === true ) {
                return false;
            }
        } );
        return isContain;

    },
    clone: function () {
        function cloneNode( parent, isClonedNode ) {
            var _tmp = new KM.MinderNode();

            _tmp.data = Utils.clonePlainObject( isClonedNode.getData() );
            _tmp.parent = parent;
            if ( parent ) {
                parent.children.push( _tmp );
            }
            for ( var i = 0, ci; ci = isClonedNode.children[ i++ ]; ) {
                cloneNode( _tmp, ci );
            }
            return _tmp;
        }
        return function () {
            return cloneNode( null, this );

        }
    }(),
    equals: function ( node ) {
        if ( node.children.length != this.children.length ) {
            return false;
        }
        if ( utils.compareObject( node.getData(), this.getData() ) === false ) {
            return false;
        }

        for ( var i = 0, ci; ci = this.children[ i++ ]; ) {
            if ( ci.equals( node ) === false ) {
                return false;
            }
        }
        return true;

    },
    getTextShape:function(){
        return this.getRenderContainer().getShapesByType('text')[0]
    }
} );