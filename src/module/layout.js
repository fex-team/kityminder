KityMinder.registerModule( "LayoutModule", function () {
	var CreateChildNodeCommand = kity.createClass( "CreateChildNodeCommand", ( function () {

		return {
			base: Command,
			execute: function ( km, parent ) {

			}
		}
	} )() );
	var CreateSiblingNodeCommand = kity.createClass( "reateSiblingNodeCommand", ( function () {

		return {
			base: Command,
			execute: function ( km, sibling ) {

			}
		}
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {

		return {
			base: Command,
			execute: function ( km, node ) {

			}
		}
	} )() );
	return {
		"commands": {
			"createchildnode": CreateChildNodeCommand,
			"createsiblingnode": CreateSiblingNodeCommand,
			"removenode": RemoveNodeCommand
		},

		"events": {

		}
	};
} );