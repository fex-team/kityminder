KityMinder.registerModule( "LayoutModule", function () {
	var createChildNode = function ( km, parent ) {
		var _node = new MinderNode();
		_node.setData( "y", Math.random() * 300 + 100 );
		_node.setData( "text", "New Node" );
		switch ( parent.branchside ) {
		case "left":
			break;
		case "right":
			break;
		default:
			( function () {
				var children = parent.getChildren();
				if ( children.length < 5 ) {
					_node.setData( "x", parent.getData( "x" ) + 200 );
					_node.setData( "align", "left" );
				} else {
					_node.setData( "x", parent.getData( "x" ) - 200 );
					_node.setData( "align", "right" );
				}
			} )();
			break;
		}
		parent.insertChild( _node );
		km.execCommand( 'rendernode', _node );
		return _node;
	};

	var CreateChildNodeCommand = kity.createClass( "CreateChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: createChildNode
		};
	} )() );

	var CreateSiblingNodeCommand = kity.createClass( "CreateSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, sibling ) {
				console.log( sibling );
				var parent = sibling.getParent();
				if ( parent ) {
					createChildNode( km, parent );
				}
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