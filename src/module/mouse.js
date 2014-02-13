KityMinder.registerModule( "MouseModule", function () {
    var minder = this;

    function getTouchDistance( e ) {
        return kity.Vector.fromPoints( e.kityEvent.getPosition( 0 ), e.kityEvent.getPosition( 1 ) ).length();
    }

    var SelectArea = ( function () {
        var startPos = null;
        var selectRect = new kity.Path().fill( 'rgba(255,255,255,.5)' ).stroke( 'white' );
        var min = function ( a, b ) {
            return a < b ? a : b;
        };
        var max = function ( a, b ) {
            return a > b ? a : b;
        };
        var inArea = function ( p1, p2, p ) {
            var minx = min( p1.x, p2.x );
            var maxx = max( p1.x, p2.x );
            var miny = min( p1.y, p2.y );
            var maxy = max( p1.y, p2.y );
            if ( p.x >= minx && p.x <= maxx && p.y >= miny && p.y <= maxy ) {
                return true;
            } else {
                return false;
            }
        };

        return {
            selectStart: function ( e ) {
                if ( e.originEvent.button ) return;
                if ( startPos ) return this.selectEnd();
                minder._paper.addShape( selectRect );
                startPos = e.getPosition();
                selectRect.setOpacity( 0.8 ).getDrawer().clear();
            },
            selectMove: function ( e ) {
                var p = e.getPosition();
                if ( startPos ) {
                    var d = selectRect.getDrawer();
                    d.clear().moveTo( startPos.x, startPos.y )
                        .lineTo( p.x, startPos.y )
                        .lineTo( p.x, p.y )
                        .lineTo( startPos.x, p.y ).close();
                    var _buffer = [ minder.getRoot() ];
                    while ( _buffer.length !== 0 ) {
                        _buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
                        var _bufferPoint = _buffer[ 0 ].getRenderContainer().getRenderBox().closurePoints;
                        var sel = false;
                        for ( var i = 0; i < _bufferPoint.length; i++ ) {
                            if ( inArea( startPos, p, _bufferPoint[ i ] ) ) {
                                minder.select( _buffer[ 0 ] );
                                sel = true;
                                break;
                            }
                        }
                        if ( !sel ) {
                            minder.removeSelectedNodes( _buffer[ 0 ] );
                        }
                        _buffer.shift();
                    }
                }
            },
            selectEnd: function ( e ) {
                if ( startPos ) {
                    selectRect.fadeOut( 200, 'ease' );
                }
                startPos = null;
            }
        };
    } )();
    return {

        "events": {
            'mousedown touchstart': function ( e ) {
                if ( e.originEvent.touches && e.originEvent.touches.length != 1 ) return;
                var clickNode = e.getTargetNode();
                if ( clickNode ) {
                    this.select( clickNode, true );
                } else {
                    this.removeAllSelectedNodes();
                    SelectArea.selectStart( e );
                }
            },
            'touchstart': function ( e ) {
                var me = this;
                if ( e.originEvent.touches.length === 2 ) {
                    this._lastTouchDistance = getTouchDistance( e );
                    this._lastTouchViewport = this._paper.getViewPort();
                    console.log( 'start: ', this._lastTouchDistance, this._lastTouchViewport );
                } else if ( e.originEvent.touches.length === 1 ) {

                    var node = e.getTargetNode();
                    if ( !node ) return;
                    this._touchTimeout = setTimeout( function () {

                    }, 200 );
                }
            },
            'touchend touchmove': function () {
                clearTimeout( this._touchTimeout );
            },
            'touchmove': function ( e ) {
                if ( e.originEvent.touches.length === 2 ) {
                    var ld = this._lastTouchDistance,
                        cd = getTouchDistance( e );
                    var lv = this._lastTouchViewport,
                        cv = this._paper.getViewPort();
                    cv.zoom = lv.zoom * cd / ld;
                    this._paper.setViewPort( cv );
                    console.log( 'move: ', cv );
                }
            },
            'mousemove touchmove': function ( e ) {
                SelectArea.selectMove( e );
            },
            'touchend mouseup': function ( e ) {
                SelectArea.selectEnd( e );
            }
        }
    };
} );