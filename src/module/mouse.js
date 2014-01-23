KityMinder.registerModule( "MouseModule", function () {
    var minder = this;

    function getTouchDistance( e ) {
        return kity.Vector.fromPoints( e.kityEvent.getPosition( 0 ), e.kityEvent.getPosition( 1 ) ).length();
    }

    var SelectArea = this.SelectArea = ( function () {
        var startPos = null;
        var selectRect = null;
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
                selectRect = new kity.Polygon();
                minder.getRenderContainer().addShape( selectRect );
                var p = e.getPosition();
                startPos = {
                    x: p.x,
                    y: p.y
                };
            },
            selectMove: function ( e ) {
                var p = e.getPosition();
                if ( startPos ) {
                    var points = [ new kity.Point( startPos.x, startPos.y ),
                        new kity.Point( p.x, startPos.y ),
                        new kity.Point( p.x, p.y ),
                        new kity.Point( startPos.x, p.y )
                    ];
                    selectRect.setPoints( points ).fill( "white" ).setOpacity( 0.5 );
                    var _buffer = [ minder.getRoot() ];
                    while ( _buffer.length !== 0 ) {
                        _buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
                        var _buffer0Shape = _buffer[ 0 ].getRenderContainer().getRenderBox();
                        var _bufferPoint = {
                            x: _buffer0Shape.x,
                            y: _buffer0Shape.y
                        };
                        if ( inArea( startPos, p, _bufferPoint ) ) {
                            minder.addSelect( _buffer[ 0 ] );
                        }
                        _buffer.shift();
                    }
                }
            },
            selectEnd: function ( e ) {
                if ( startPos ) selectRect.remove();
                startPos = null;
            }
        };
    } )();
    return {
        "init": function () {
            // kity.extendClass( kity.Paper, Draggable );
            // this._paper.drag();
        },
        "events": {
            'mousedown touchstart': function ( e ) {
                if ( e.originEvent.touches && e.originEvent.touches.length != 1 ) return;
                var clickNode = e.getTargetNode();
                if ( clickNode ) {
                    this.select( clickNode );
                } else {
                    this.removeAllSelectedNodes();
                    this.SelectArea.selectStart( e );
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
                        me.clearSelect();
                        me.execCommand( 'kbCreateAndEdit', 'child', node );
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
                this.SelectArea.selectMove( e );
            },
            'touchend mouseup': function ( e ) {
                this.SelectArea.selectEnd( e );
            }
        }
    };
} );