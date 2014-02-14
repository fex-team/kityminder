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
			reader.onload = function () {};
			var data = readFile( e.dataTransfer.files[ 0 ] );
			minder.importData( data );
		}
	}

	function readFile( e ) {
		var reader = new FileReader();
		return reader.readAsText();
	}

	return {
		events: {
			ready: init
		}
	};
} );