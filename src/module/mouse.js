KityMinder.registerModule( "MouseModule", function () {
    var Draggable = ( function () {
        var Paper = kity.Paper;

        var touchable = window.ontouchstart !== undefined;
        var DRAG_START_EVENT = touchable ? 'touchstart' : 'mousedown',
            DRAG_MOVE_EVENT = touchable ? 'touchmove' : 'mousemove',
            DRAG_END_EVENT = touchable ? 'touchend' : 'mouseup';

        return kity.createClass( {
            drag: function ( opt ) {

                if ( this.dragEnabled ) {
                    return;
                }

                var dragStart = opt && opt.start || this.dragStart,
                    dragMove = opt && opt.move || this.dragMove,
                    dragEnd = opt && opt.end || this.dragEnd,
                    dragTarget = opt && opt.target || this.dragTarget || this,
                    me = this;

                this.dragEnabled = true;
                this.dragTarget = dragTarget;

                function bindEvents( paper ) {

                    var startPosition, lastPosition, dragging = false;

                    var dragFn = function ( e ) {
                        if ( !dragging ) {
                            paper.off( DRAG_MOVE_EVENT, dragFn );
                        }

                        if ( e.originEvent.touches && e.originEvent.touches.length !== 1 ) return;

                        var currentPosition = e.getPosition();
                        var movement = {
                            x: currentPosition.x - startPosition.x,
                            y: currentPosition.y - startPosition.y
                        };
                        var delta = {
                            x: currentPosition.x - lastPosition.x,
                            y: currentPosition.y - lastPosition.y
                        };
                        var dragInfo = {
                            position: currentPosition,
                            movement: movement,
                            delta: delta
                        };
                        lastPosition = currentPosition;

                        if ( dragMove ) {
                            dragMove.call( me, dragInfo );
                        } else if ( me instanceof Paper ) {
                            // treate paper drag different
                            var view = me.getViewPort();
                            view.center.x -= delta.x;
                            view.center.y -= delta.y;
                            me.setViewPort( view );
                        } else {
                            me.translate( delta.x, delta.y );
                        }

                        dragTarget.trigger( 'dragmove', dragInfo );
                        e.stopPropagation();
                        e.preventDefault();
                    };

                    dragTarget.on( DRAG_START_EVENT, dragTarget._dragStartHandler = function ( e ) {
                        if ( e.originEvent.button ) {
                            return;
                        }
                        dragging = true;

                        var dragInfo = {
                            position: lastPosition = startPosition = e.getPosition()
                        };

                        if ( dragStart ) {
                            var cancel = dragStart.call( me, dragInfo ) === false;
                            if ( cancel ) {
                                return;
                            }
                        }

                        paper.on( DRAG_MOVE_EVENT, dragFn );

                        dragTarget.trigger( 'dragstart', dragInfo );

                        e.stopPropagation();
                        e.preventDefault();
                    } );

                    paper.on( DRAG_END_EVENT, dragTarget._dragEndHandler = function ( e ) {
                        if ( dragging ) {
                            dragging = false;
                            if ( dragEnd ) {
                                dragEnd.call( me );
                            }

                            paper.off( DRAG_MOVE_EVENT, dragFn );
                            dragTarget.trigger( 'dragend' );

                            e.stopPropagation();
                            e.preventDefault();
                        }
                    } );
                }

                if ( me instanceof Paper ) {
                    bindEvents( me );
                } else if ( me.getPaper() ) {
                    bindEvents( me.getPaper() );
                } else {
                    var listener = function ( e ) {
                        if ( e.targetShape.getPaper() ) {
                            bindEvents( e.targetShape.getPaper() );
                            me.off( 'add', listener );
                            me.off( 'treeadd', listener );
                        }
                    };
                    me.on( 'add treeadd', listener );
                }
                return this;
            }, // end of drag


            undrag: function () {
                var target = this.dragTarget;
                target.off( DRAG_START_EVENT, target._dragStartHandler );
                target.getPaper().off( DRAG_END_EVENT, target._dragEndHandler );
                delete target._dragStartHandler;
                delete target._dragEndHandler;
                this.dragEnabled = false;
                return this;
            }
        } );
    } )();

    function getTouchDistance( e ) {
        return kity.Vector.fromPoints( e.kityEvent.getPosition( 0 ), e.kityEvent.getPosition( 1 ) ).length();
    }
    return {
        "init": function () {
//            kity.extendClass( kity.Paper, Draggable );
//            this._paper.drag();
        },
        "events": {
            'mousedown touchstart': function ( e ) {
                if ( e.originEvent.touches && e.originEvent.touches.length != 1 ) return;
                var clickNode = e.getTargetNode();
                if(clickNode){
                    this.select(clickNode)
                }else{
                    this.removeAllSelectedNodes()
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
            }
        }
    };
} );