KityMinder.registerProtocal( 'json', function () {
	function filter( key, value ) {
		if ( key == 'layout' || key == 'shicon' ) {
			return undefined;
		}
		return value;
	}
	return {
		fileDescription: 'KityMinder',
		fileExtension: '.km',
		encode: function ( json ) {
			return JSON.stringify( json, filter );
		},
		decode: function ( local ) {
			return JSON.parse( local );
		},
		recognize: function ( local ) {
			return Utils.isString( local ) && local.charAt( 0 ) == '{' && local.charAt( local.length - 1 ) == '}';
		}
	};
} );