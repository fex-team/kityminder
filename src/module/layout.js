KityMinder.registerModule( "LayoutModule", function () {
	var CreateChildNodeCommand = kity.createClass( "CreateChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, parent ) {
				var _node = new MinderNode();
				var _nodeD = {
					text: "New Node",
					x: parent.getData( "data" ).x + 200,
					y: Math.random() * 300 + 100,
					align: "left"
				};
				switch ( parent.branchside ) {
				case "left":
					break;
				case "right":
					break;
				default:
					break;
				};
				_node.setData( "data", _nodeD );
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