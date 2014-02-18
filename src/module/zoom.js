KityMinder.registerModule( 'Zoom', function () {
	
	return {
		events: {
			'mousewheel': function ( e ) {
				
				e.originEvent.preventDefault();
			},
			'ready': function () {
				this._zoom = 1;
			}
		}
	};
} );