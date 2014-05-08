KityMinder.registerModule( 'Zoom', function () {
    var me = this;

    var timeline;

    me.setOptions( 'zoom', [ 50, 80, 100, 120, 150, 200 ] );

    function zoomMinder( minder, zoom ) {
        var paper = minder.getPaper();
        var viewport = paper.getViewPort();

        if ( !zoom ) return;

        var animator = new kity.Animator( {
            beginValue: viewport.zoom,
            finishValue: zoom / 100,
            setter: function ( target, value ) {
                viewport.zoom = value;
                target.setViewPort( viewport );
            }
        } );
        minder.zoom = zoom;
        if ( timeline ) {
            timeline.pause();
        }
        timeline = animator.start( paper, 500, 'ease' );
    }

    var ZoomCommand = kity.createClass( 'Zoom', {
        base: Command,
        execute: zoomMinder,
        queryValue: function ( minder ) {
            return minder.zoom;
        }
    } );

    var ZoomInCommand = kity.createClass( 'ZoomInCommand', {
        base: Command,
        execute: function ( minder ) {
            zoomMinder( minder, this.nextValue( minder ) );
        },
        queryState: function ( minder ) {
            return ~this.nextValue( minder );
        },
        nextValue: function ( minder ) {
            var stack = minder.getOptions( 'zoom' ),
                i;
            for ( i = 0; i < stack.length; i++ ) {
                if ( stack[ i ] > minder.zoom ) return stack[ i ];
            }
            return 0;
        },
        enableReadOnly: false
    } );

    var ZoomOutCommand = kity.createClass( 'ZoomOutCommand', {
        base: Command,
        execute: function ( minder ) {
            zoomMinder( minder, this.nextValue( minder ) );
        },
        queryState: function ( minder ) {
            return ~this.nextValue( minder );
        },
        nextValue: function ( minder ) {
            var stack = minder.getOptions( 'zoom' ),
                i;
            for ( i = stack.length - 1; i >= 0; i-- ) {
                if ( stack[ i ] < minder.zoom ) return stack[ i ];
            }
            return 0;
        },
        enableReadOnly: false
    } );

    return {
        init: function () {
            this.zoom = 100;
        },
        commands: {
            'zoom-in': ZoomInCommand,
            'zoom-out': ZoomOutCommand,
            'zoom': ZoomCommand
        },
        events: {
            'normal.keydown': function ( e ) {
                var me = this;
                var originEvent = e.originEvent;
                var keyCode = originEvent.keyCode || originEvent.which;
                if ( keymap[ '=' ] == keyCode ) {
                    me.execCommand( 'zoom-in' );
                }
                if ( keymap[ '-' ] == keyCode ) {
                    me.execCommand( 'zoom-out' );

                }
            },
            'ready': function () {
                this._zoomValue = 1;
            },
            'normal.mousewheel readonly.mousewheel': function ( e ) {
                if ( !e.originEvent.ctrlKey ) return;
                var delta = e.originEvent.wheelDelta;
                var me = this;

                if ( !kity.Browser.mac ) {
                    delta = -delta;
                }

                // 稀释
                if ( Math.abs( delta ) > 100 ) {
                    clearTimeout( this._wheelZoomTimeout );
                } else {
                    return;
                }

                this._wheelZoomTimeout = setTimeout( function () {
                    var value;
                    var lastValue = me.getPaper()._zoom || 1;
                    if ( delta < 0 ) {
                        me.execCommand( 'zoom-in' );
                    } else if ( delta > 0 ) {
                        me.execCommand( 'zoom-out' );
                    }
                }, 100 );

                e.originEvent.preventDefault();
            }
        }
    };
} );