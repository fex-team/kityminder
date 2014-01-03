KityMinder.registerModule( "LayoutModule", function () {
	var CreateChildNodeCommand = kity.createClass( "CreateChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, parent ) {
				console.log( 'create!!!' );
				var _node = new MinderNode();
				parent.insertChild( _node );
				km.execCommand( 'rendernode', _node );
				return _node;
			}
		}
	} )() );
	var CreateSiblingNodeCommand = kity.createClass( "CreateSiblingNodeCommand", ( function () {

		return {
			base: Command,
			execute: function ( km, sibling, node ) {
				var parent = sibling.getParent();
				parent.insertChild( node );
			}
		}
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {

		return {
			base: Command,
			execute: function ( km, node ) {
				var parent = sibling.getParent();
				parent.removeChild( node );
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