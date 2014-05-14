var MinderNode = KityMinder.MinderNode = kity.createClass( "MinderNode", {
    constructor: function ( options ) {
        this.parent = null;
        this.children = [];
        this.data = {};
        this.tmpData = {};
        if ( Utils.isString( options ) ) {
            this.setData( 'text', options );
        } else {
            this.setData( options );
        }
        this._createShapeDom();
        this.setData( "layout", {} );
    },
    _createShapeDom: function () {
        this.rc = new kity.Group();
        this.rc.addClass( 'km-minderNode' );
        this.rc.minderNode = this;
        this._createBgGroup();
        this._createContGroup();
    },
    _createGroup: function ( type ) {
        var g = new kity.Group();
        g.setData( 'rctype', type );
        this.rc.appendShape( g );
    },
    _createBgGroup: function () {
        this._createGroup( 'bgrc' );
    },
    _createContGroup: function () {
        this._createGroup( 'contrc' );
    },
    getContRc: function () {
        var groups = this.rc.getShapesByType( 'group' ),
            result;
        Utils.each( groups, function ( i, p ) {
            if ( p.getData( 'rctype' ) == 'contrc' ) {
                result = p;
                return false;
            }
        } );
        return result;
    },
    getBgRc: function () {
        var groups = this.rc.getShapesByType( 'group' ),
            result;
        Utils.each( groups, function ( i, p ) {
            if ( p.getData( 'rctype' ) == 'bgrc' ) {
                result = p;
                return false;
            }
        } );
        return result;
    },
    setPoint: function ( x, y ) {
        if ( arguments.length < 2 ) {
            this.setData( "point", x );
        } else {
            this.setData( 'point', {
                x: x,
                y: y
            } );
        }
    },
    getPoint: function () {
        return this.getData( 'point' );
    },
    setType: function ( type ) {
        this.setData( 'type', type );
    },
    getLevel: function () {
        var level = 0,
            parent = this.parent;
        while ( parent ) {
            level++;
            parent = parent.parent;
        }
        return level;
    },
    getType: function ( type ) {
        var cached = this.getData( 'type' );
        if ( cached ) {
            return cached;
        }
        var level = Math.min( this.getLevel(), 2 );
        cached = [ 'root', 'main', 'sub' ][ level ];
        this.setData( 'type', cached );
        return cached;
    },
    setText: function ( text ) {
        this.setData( 'text', text );
        this.getTextShape().setContent( text );
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

    isAncestorOf: function ( test ) {
        var p = test.parent;
        while ( p ) {
            if ( p == this ) return true;
            p = p.parent;
        }
        return false;
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
        node.root = node.parent.root;

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
        function cloneNode( parent, isClonedNode) {
            var _tmp = new KM.MinderNode( isClonedNode.getText() );

            _tmp.data = Utils.clonePlainObject( isClonedNode.getData() );
            _tmp.tmpData = Utils.clonePlainObject( isClonedNode.getTmpData() );
            _tmp.parent = parent;

            if ( parent ) {
                parent.children.push( _tmp );
            }
            for ( var i = 0, ci;
                ( ci = isClonedNode.children[ i++ ] ); ) {
                cloneNode( _tmp, ci );
            }
            return _tmp;
        }
        return function () {
            return cloneNode( null, this );
        };
    }(),
    equals: function ( node ) {
        if ( node.children.length != this.children.length ) {
            return false;
        }
        if ( utils.compareObject( node.getData(), this.getData() ) === false ) {
            return false;
        }
        if ( utils.compareObject( node.getTmpData(), this.getTmpData() ) === false ) {
            return false;
        }
        for ( var i = 0, ci;
            ( ci = this.children[ i ] ); i++ ) {
            if ( ci.equals( node.children[ i ] ) === false ) {
                return false;
            }
        }
        return true;

    },
    getTextShape: function () {
        var textShape;
        utils.each( this.getContRc().getShapesByType( 'text' ), function ( i, t ) {
            if ( t.getAttr( '_nodeTextShape' ) ) {
                textShape = t;
                return false;
            }
        } );

        return textShape;
    },
    isSelected: function () {
        return this.getTmpData( 'highlight' ) === true;
    },
    clearChildren: function () {
        this.children = [];
    },
    isHighlight: function () {
        return this.getTmpData( 'highlight' )
    },
    select:function(){
        this.setTmpData('highlight',true)
    },
    setTmpData: function ( a, v ) {
        var me = this;
        if ( utils.isObject( a ) ) {
            utils.each( a, function ( key,val) {
                me.setTmpData( key, val )
            } )
        }
        if ( v === undefined || v === null || v === '' ) {
            delete this.tmpData[ a ];
        } else {
            this.tmpData[ a ] = v;
        }
    },
    getTmpData: function ( a ) {
        if ( a === undefined ) {
            return this.tmpData;
        }
        return this.tmpData[ a ]
    },
    setValue:function(node){
        this.data = {};
        this.setData(utils.clonePlainObject(node.getData()));
        this.tmpData = {};
        this.setTmpData(utils.clonePlainObject(node.getTmpData()));
        return this;
    }
} );