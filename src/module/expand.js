KityMinder.registerModule( "Expand", function () {
	var ExpandCommand = kity.createClass( "ExpandCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				km.initStyle( true );
			},
			queryState: function ( km ) {
				return 0;
			}
		};
	} )() );
	var ContractCommand = kity.createClass( "ContractCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				km.initStyle();
			},
			queryState: function ( km ) {
				return 0;
			}
		};
	} )() );
	return {
		'commands': {
			'expand': ExpandCommand,
			'contract': ContractCommand
		}
	};
} );