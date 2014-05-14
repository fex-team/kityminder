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
        this._paper.on( 'click dblclick mousedown contextmenu mouseup mousemove mousewheel DOMMouseScroll touchstart touchmove touchend', this._firePharse.bind( this ) );
        if ( window ) {
            window.addEventListener( 'resize', this._firePharse.bind( this ) );
            window.addEventListener( 'blur', this._firePharse.bind( this ) );
        }
    },
    _bindKeyboardEvents: function () {
        if ( ( navigator.userAgent.indexOf( 'iPhone' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPod' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPad' ) == -1 ) ) {
            //只能在这里做，要不无法触发
            Utils.listen( document.body, 'keydown keyup keypress paste', this._firePharse.bind( this ) );
        }
    },
    _firePharse: function ( e ) {
//        //只读模式下强了所有的事件操作
//        if(this.readOnly === true){
//            return false;
//        }
        var beforeEvent, preEvent, executeEvent;

        if ( e.type == 'DOMMouseScroll' ) {
            e.type = 'mousewheel';
            e.wheelDelta = e.originEvent.wheelDelta = e.originEvent.detail * 120;
        }

        beforeEvent = new MinderEvent( 'before' + e.type, e, true );
        if ( this._fire( beforeEvent ) ) {
            return;
        }
        preEvent = new MinderEvent( 'pre' + e.type, e, false );
        executeEvent = new MinderEvent( e.type, e, false );

        this._fire( preEvent );
        this._fire( executeEvent );
        this._fire( new MinderEvent( 'after' + e.type, e, false ) );

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
        }, 20 );
    },
    _listen: function ( type, callback ) {
        var callbacks = this._eventCallbacks[ type ] || ( this._eventCallbacks[ type ] = [] );
        callbacks.push( callback );
    },
    _fire: function ( e ) {


        var status = this.getStatus();

        var callbacks = this._eventCallbacks[ e.type.toLowerCase() ] || [];

        if ( status ) {

            callbacks = callbacks.concat( this._eventCallbacks[ status + '.' + e.type.toLowerCase() ] || [] );
        }



        if ( callbacks.length === 0 ) {
            return;
        }
        var lastStatus = this.getStatus();

        for ( var i = 0; i < callbacks.length; i++ ) {

            callbacks[ i ].call( this, e );


            if ( this.getStatus() != lastStatus || e.shouldStopPropagationImmediately() ) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function ( name, callback ) {
        var km = this;
        utils.each( name.split( /\s+/ ), function ( i, n ) {
            km._listen( n.toLowerCase(), callback );
        } );
        return this;
    },
    off: function ( name, callback ) {

        var types = name.split( /\s+/ );
        var i, j, callbacks, removeIndex;
        for ( i = 0; i < types.length; i++ ) {

            callbacks = this._eventCallbacks[ types[ i ].toLowerCase() ];
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