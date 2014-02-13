KityMinder.registerModule( 'Zoom', function () {
	return {
		events: {
			'mousewheel': function ( e ) {
				var viewport = this._paper.getViewPort();
				if ( e.originEvent.wheelDelta > 0 ) {
					viewport.zoom = viewport.zoom * 0.95;
				} else {
					viewport.zoom = viewport.zoom / 0.95;
				}
				//this._paper.setViewPort( viewport );
			}
		}
	};
} );