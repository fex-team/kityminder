KityMinder.registerModule( 'Zoom', function () {
	var MAX_ZOOM = 2,
		MIN_ZOOM = 0.5,
		ZOOM_STEP = Math.sqrt( 2 );

	function zoom( minder, rate ) {
		var paper = minder.getPaper();
		var viewbox = paper.getViewBox();
		var zoomValue = minder._zoomValue;
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
		minder._zoomValue = zoomValue *= rate;
	}

	var ZoomInCommand = kity.createClass( 'ZoomInCommand', {
		base: Command,
		execute: function ( minder ) {
			if( !this.queryState( minder ) ) {
				zoom( minder, 1 / ZOOM_STEP );
			}
		},
		queryState: function ( minder ) {
			return (minder._zoomValue > MIN_ZOOM) ? 0 : -1;
		}
	} );

	var ZoomOutCommand = kity.createClass( 'ZoomOutCommand', {
		base: Command,
		execute: function ( minder ) {
			if( !this.queryState( minder ) ) {
				zoom( minder, ZOOM_STEP );
			}
		},
		queryState: function ( minder ) {
			return (minder._zoomValue < MAX_ZOOM) ? 0 : -1;
		}
	} );

	return {
		commands: {
			'zoom-in': ZoomInCommand,
			'zoom-out': ZoomOutCommand
		},
		addShortcutKeys: {
			"zoom-in": "=", //=
			"zoom-out": "-" //-
		},
		events: {
			'ready': function () {
				this._zoomValue = 1;
			},
			'mousewheel': function ( e ) {
				var delta = e.originEvent.wheelDelta;
				var me = this;

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
						me.execCommand('zoom-in');
					} else if ( delta > 0 ) {
						me.execCommand('zoom-out');
					}
				}, 100 );

				e.originEvent.preventDefault();
			}
		}
	};
} );