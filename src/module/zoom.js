KityMinder.registerModule( 'Zoom', function () {

	return {
		events: {
			'mousewheel': function ( e ) {
				if ( e.originEvent.wheelDelta > 0 ) {
					if ( this._zoom < 0.2 ) return;
					this._zoom *= 0.95;
					this.getRenderContainer().scale( 0.95 );
				} else {
					if ( this._zoom > 5 ) return;
					this._zoom /= 0.95;
					this.getRenderContainer().scale( 1 / 0.95 );
				}
				e.originEvent.preventDefault();
			},
			'ready': function () {
				this._zoom = 1;
			}
		}
	};
} );