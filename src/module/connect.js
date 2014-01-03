var ConnectModule = KityMinder.registerModule( "ConnectModule", function () {
	return {
		"events": {
			"command": function ( e ) {
				var command = e;
				switch ( command.commandName ) {
				case "rendernode":
					( function () {
						var minder = command.commandArgs[ 0 ];
						var node = command.commandArgs[ 1 ];
						if ( !node.parent ) {
							return false;
						} else {
							var parent = node.parent;
							// var _connect = new kity.Bezier(
							// [ new kity.Point( parent.data.centerX, parent.data.centerY ),
							// 		new kity.Point( node.data.centerX, node.data.centerY )
							// 	] );
							_connect.stroke( new Pen( node.data.stroke, node.data.strokeWidth ) );
							minder.addShape( _connect );
						}
					} )();
					break;
				case "erasenode":
					break;
				default:
					break;
				};
			}
		}
	};
} );