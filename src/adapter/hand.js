function zoom( paper, rate ) {
    var viewbox = paper.getViewBox();
    var zoomValue = paper._zoom || 1;
    var w = viewbox.width,
        h = viewbox.height,
        x = viewbox.x,
        y = viewbox.y;
    var ww = w * rate,
        hh = h * rate,
        xx = x + ( w - ww ) / 2,
        yy = y + ( h - hh ) / 2;
    var animator = new kity.Animator( {
        beginValue: viewbox,
        finishValue: {
            width: ww,
            height: hh,
            x: xx,
            y: yy
        },
        setter: function ( target, value ) {
            target.setViewBox( value.x, value.y, value.width, value.height );
        }
    } );

    animator.start( paper, 100, 'ease' );
    paper._zoom = zoomValue *= rate;
    return zoomValue;
}

KM.registerUI( 'hand zoom-in zoom-out',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: {
                'hand': function ( e ) {
                    var drag = me._onDragMode = !me._onDragMode;
                    me._paper.setStyle( 'cursor', drag ? 'pointer' : 'default' );
                    me._paper.setStyle( 'cursor', drag ? '-webkit-grab' : 'default' );
                    $btn.kmui().active( drag );
                    if ( drag ) {
                        me._paper.drag();
                    } else {
                        me._paper.undrag();
                    }
                },
                'zoom-in': function ( e ) {
                    var value = zoom( me.getPaper(), 0.707 );
                    me.fire( 'zoom', {
                        zoom: value
                    } );
                },
                'zoom-out': function ( e ) {
                    var value = zoom( me.getPaper(), 1 / 0.707 );
                    me.fire( 'zoom', {
                        zoom: value
                    } );
                }
            }[ name ],
            title: this.getLang( 'tooltips.' )[ name ] || ''
        } );
        switch ( name ) {
        case 'hand':
            me.on( 'beforemousemove', function ( e ) {
                if ( this._onDragMode ) {
                    e.stopPropagation();
                }
            } );
            kity.extendClass( kity.Paper, kity.Draggable );
            break;
        case 'zoom-in':
            me.on( 'zoom', function ( e ) {
                $btn.kmui().disabled( e.zoom <= 0.5 );
            } );
            break;
        case 'zoom-out':
            me.on( 'zoom', function ( e ) {
                $btn.kmui().disabled( e.zoom >= 2 );
            } );
            me.on( 'mousewheel', function ( e ) {
                var delta = e.originEvent.wheelDelta;
                if ( Math.abs( delta ) > 100 ) {
                    clearTimeout( me._wheelZoomTimeout );
                } else {
                    return;
                }
                me._wheelZoomTimeout = setTimeout( function () {
                    var value;
                    var lastValue = me.getPaper()._zoom || 1;
                    if ( delta < 0 && lastValue > 0.5 ) {
                        value = zoom( me.getPaper(), 0.707 );
                        me.fire( 'zoom', {
                            zoom: value
                        } );
                    } else if ( delta > 0 && lastValue < 2 ) {
                        value = zoom( me.getPaper(), 1 / 0.707 );
                        me.fire( 'zoom', {
                            zoom: value
                        } );
                    }
                }, 100 );
                e.originEvent.preventDefault();
            } );
        }
        return $btn;
    }
);