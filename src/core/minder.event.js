// 事件机制
kity.extendClass( Minder, {
    _initEvents: function () {
        this._eventCallbacks = {};
    },
    _bindEvents: function () {
        this._bindPaperEvents();
        this._bindKeyboardEvents();
    },
    _resetEvents: function () {
        this._initEvents();
        this._bindEvents();
    },
    // TODO: mousemove lazy bind
    _bindPaperEvents: function () {
        var minder = this;
        this._paper.on( 'click mousedown mouseup mousemove touchstart touchmove touchend', this._firePharse.bind( this ) );
    },
    _bindKeyboardEvents: function () {
        if ( ( navigator.userAgent.indexOf( 'iPhone' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPod' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPad' ) == -1 ) ) {
            //只能在这里做，要不无法触发
            Utils.listen( document.body,  'keydown keyup keypress', this._firePharse.bind( this ) );
        }
    },
    _firePharse: function ( e ) {
        var beforeEvent, preEvent, executeEvent;
        beforeEvent = new MinderEvent( 'before' + e.type, e, true );
        if ( this._fire( beforeEvent ) ) {
            return;
        }
        preEvent = new MinderEvent( 'pre' + e.type, e, false );
        executeEvent = new MinderEvent( e.type, e, false );
        this._fire( preEvent );
        this._fire( executeEvent );
        if ( ~'mousedown mouseup keydown keyup'.indexOf( e.type ) ) {
            this._interactChange( e );
        }
    },
    _interactChange: function ( e ) {
        var minder = this;
        clearTimeout( this._interactTimeout );
        this._interactTimeout = setTimeout( function () {
            var stoped = minder._fire( new MinderEvent( 'beforeinteractchange' ) );
            if ( stoped ) {
                return;
            }
            minder._fire( new MinderEvent( 'preinteractchange' ) );
            minder._fire( new MinderEvent( 'interactchange' ) );
        }, 300 );
    },
    _listen: function ( type, callback ) {
        var callbacks = this._eventCallbacks[ type ] || ( this._eventCallbacks[ type ] = [] );
        callbacks.push( callback );
    },
    _fire: function ( e ) {
        var callbacks = this._eventCallbacks[ e.type ];
        if ( !callbacks ) {
            return false;
        }
        for ( var i = 0; i < callbacks.length; i++ ) {
            callbacks[ i ].call( this, e );
            if ( e.shouldStopPropagationImmediately() ) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function ( name, callback ) {
        var types = name.split( ' ' );
        for ( var i = 0; i < types.length; i++ ) {
            this._listen( types[ i ], callback );
        }
        return this;
    },
    off: function ( name, callback ) {
        var types = name.split( ' ' );
        var i, j, callbacks, removeIndex;
        for ( i = 0; i < types.length; i++ ) {
            callbacks = this._eventCallbacks[ types[ i ] ];
            if ( callbacks ) {
                removeIndex = null;
                for ( j = 0; j < callbacks.length; j++ ) {
                    if ( callbacks[ j ] == callback ) {
                        removeIndex = j;
                    }
                }
                if ( removeIndex !== null ) {
                    callbacks.splice( removeIndex, 1 );
                }
            }
        }
    },
    fire: function ( type, params ) {
        var e = new MinderEvent( type, params );
        this._fire( e );
        return this;
    }
} );