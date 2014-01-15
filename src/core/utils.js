var utils = Utils = KityMinder.Utils = {
    extend: kity.Utils.extend.bind( kity.Utils ),

    listen: function ( element, type, handler ) {
        var types = utils.isArray( type ) ? type : utils.trim( type ).split( /\s+/ ),
            k = types.length;
        if ( k )
            while ( k-- ) {
                type = types[ k ];
                if ( element.addEventListener ) {
                    element.addEventListener( type, handler, false );
                } else {
                    if ( !handler._d ) {
                        handler._d = {
                            els: []
                        };
                    }
                    var key = type + handler.toString(),
                        index = utils.indexOf( handler._d.els, element );
                    if ( !handler._d[ key ] || index == -1 ) {
                        if ( index == -1 ) {
                            handler._d.els.push( element );
                        }
                        if ( !handler._d[ key ] ) {
                            handler._d[ key ] = function ( evt ) {
                                return handler.call( evt.srcElement, evt || window.event );
                            };
                        }
                        element.attachEvent( 'on' + type, handler._d[ key ] );
                    }
                }
            }
        element = null;
    },
    trim: function ( str ) {
        return str.replace( /(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '' );
    },
    each: function ( obj, iterator, context ) {
        if ( obj == null ) return;
        if ( obj.length === +obj.length ) {
            for ( var i = 0, l = obj.length; i < l; i++ ) {
                if ( iterator.call( context, i, obj[ i ], obj ) === false )
                    return false;
            }
        } else {
            for ( var key in obj ) {
                if ( obj.hasOwnProperty( key ) ) {
                    if ( iterator.call( context, key, obj[ key ], obj ) === false )
                        return false;
                }
            }
        }
    },
    addCssRule: function ( key, style, doc ) {
        var head, node;
        if ( style === undefined || style && style.nodeType && style.nodeType == 9 ) {
            //获取样式
            doc = style && style.nodeType && style.nodeType == 9 ? style : ( doc || document );
            node = doc.getElementById( key );
            return node ? node.innerHTML : undefined;
        }
        doc = doc || document;
        node = doc.getElementById( key );

        //清除样式
        if ( style === '' ) {
            if ( node ) {
                node.parentNode.removeChild( node );
                return true
            }
            return false;
        }

        //添加样式
        if ( node ) {
            node.innerHTML = style;
        } else {
            node = doc.createElement( 'style' );
            node.id = key;
            node.innerHTML = style;
            doc.getElementsByTagName( 'head' )[ 0 ].appendChild( node );
        }
    },
    keys: function ( plain ) {
        var keys = [];
        for ( var key in plain ) {
            if ( plain.hasOwnProperty( key ) ) {
                keys.push( key );
            }
        }
        return keys;
    },
    proxy: function ( fn, context ) {
        return function () {
            return fn.apply( context, arguments );
        };
    },
    indexOf: function ( array, item, start ) {
        var index = -1;
        start = this.isNumber( start ) ? start : 0;
        this.each( array, function ( v, i ) {
            if ( i >= start && v === item ) {
                index = i;
                return false;
            }
        } );
        return index;
    },
    argsToArray: function ( args,index ) {
        return Array.prototype.slice.call( args, index || 0 );
    }

};

Utils.each( [ 'String', 'Function', 'Array', 'Number', 'RegExp', 'Object' ], function ( i, v ) {
    KityMinder.Utils[ 'is' + v ] = function ( obj ) {
        return Object.prototype.toString.apply( obj ) == '[object ' + v + ']';
    }
} );