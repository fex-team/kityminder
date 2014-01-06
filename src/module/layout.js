KityMinder.registerModule( "LayoutModule", function () {
	var CreateChildNodeCommand = kity.createClass( "CreateChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, parent ) {
				var _node = new MinderNode();
				_node.setData( "x", parent.getData( "x" ) + 200 );
				_node.setData( "y", Math.random() * 300 + 100 );
				_node.setData( "align", "left" );
				var _nodeD = {
					text: "New Node",
					align: "left"
				};
				switch ( parent.branchside ) {
				case "left":
					break;
				case "right":
					break;
				default:
					( function () {

					} )();
					break;
				}
				_node.setData( "data", _nodeD );
				parent.insertChild( _node );
				km.execCommand( 'rendernode', _node );
				return _node;
			}
		};
	} )() );

	var CreateSiblingNodeCommand = kity.createClass( "CreateSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, sibling, node ) {
				var parent = sibling.getParent();
				parent.insertChild( node );
			}
		};
	} )() );

	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {

		return {
			base: Command,
			execute: function ( km, node ) {
				var parent = node.getParent();
				parent.removeChild( node );
			}
		};
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