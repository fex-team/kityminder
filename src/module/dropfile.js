KityMinder.registerModule( "DropFile", function () {

	var social,
		draftManager,
		importing = false;

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

		if( kity.Browser.ie && Number(kity.Browser.version) < 10 ){
			alert('文件导入对IE浏览器仅支持10以上版本');
			return;
		}

		var files = e.dataTransfer.files;

		if ( files ) {
			var file = files[ 0 ];
			var ext = file.type || ( /(.)\w+$/ ).exec( file.name )[ 0 ];

			if ( ( /xmind/g ).test( ext ) ) { //xmind zip
				importSync( minder, file, 'xmind' );
			} else if ( ( /mmap/g ).test( ext ) ) { // mindmanager zip
				importSync( minder, file, 'mindmanager' );
			} else if ( ( /mm/g ).test( ext ) ) { //freemind xml
				importAsync( minder, file, 'freemind' );
			} else { // txt json
				importAsync( minder, file );
			}
		}
	}

	function afterImport() {
		if ( !importing ) return;
		createDraft( this );
		social.setRemotePath( null, false );
		this.execCommand( 'camera', this.getRoot() );
		setTimeout(function() {
			social.watchChanges( true );
		}, 10);
		importing = false;
	}

	// 同步加载文件
	function importSync( minder, file, protocal ) {
		social = social || window.social;
		social.watchChanges( false );
		importing = true;
		minder.importData( file, protocal ); //zip文件的import是同步的
	}

	// 异步加载文件
	function importAsync( minder, file, protocal ) {
		var reader = new FileReader();
		reader.onload = function ( e ) {
			importSync( minder, e.target.result, protocal );
		};
		reader.readAsText( file );
	}

	function createDraft( minder ) {
		draftManager = window.draftManager;
		draftManager.create();
	}

	return {
		events: {
			'ready': init,
			'import': afterImport
		}
	};
} );