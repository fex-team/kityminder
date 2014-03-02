KityMinder.registerModule( "DropFile", function () {

	function init() {
		var container = this.getPaper().getContainer();
		container.addEventListener( 'dragover', onDragOver );
		container.addEventListener( 'drop', onDrop.bind( this ) );
	}

	function onDragOver( e ) {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'copy';
	}

	function onDrop( e ) {
		e.preventDefault();
		e.stopPropagation();
		var minder = this;
		if ( e.dataTransfer.files ) {
			var reader = new FileReader();
			reader.onload = function ( e ) {
				minder.importData( e.target.result );
			};
			reader.readAsText( e.dataTransfer.files[ 0 ] );
		}
	}

	return {
		events: {
			ready: init
		}
	};
} );