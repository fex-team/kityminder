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

		var files = e.dataTransfer.files;

		if ( files ) {
			var file = files[0];
			var ext = file.type || (/(.)\w+$/).exec(file.name)[0];

			if( (/xmind/g).test(ext) ){ //xmind zip
				importSync( minder, file, 'xmind' );
			}else if( (/mmap/g).test(ext) ){ // mindmanager zip
				importSync( minder, file, 'mindmanager' );
			}else if( (/mm/g).test(ext) ){ //freemind xml
				importAsync( minder, file, 'freemind' );
			}else{// txt json
				importAsync( minder, file );
			}
		}
	}

	// 同步加载文件
	function importSync( minder, file, protocal ){
		minder.importData( file, protocal );//zip文件的import是同步的
		manageDraft( minder );
		minder.execCommand( 'camera', minder.getRoot() );
	}

	// 异步加载文件
	function importAsync( minder, file, protocal ){
		var reader = new FileReader();
		reader.onload = function ( e ) {
			minder.importData( e.target.result, protocal );//纯文本文件的import是同步的
			manageDraft( minder );
			minder.execCommand( 'camera', minder.getRoot() );
		};
		reader.readAsText( file );
	}
	
	function manageDraft( minder ){

		if( !window.draftManager ){
			window.draftManager = new window.DraftManager( minder );
		}

		window.draftManager.create();
	}

	return {
		events: {
			ready: init
		}
	};
} );