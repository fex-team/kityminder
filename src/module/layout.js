KityMinder.registerModule( "LayoutModule", function () {
	var createChildNode = function ( km, parent ) {
		var children = parent.getChildren();
		var _node = new MinderNode();
		_node.setData( "y", Math.random() * 500 + 10 );
		_node.setData( "text", "New Node" );
		switch ( parent.getData( "branchside" ) ) {
		case "left":
			_node.setData( "branchside", "left" );
			break;
		case "right":
			_node.setData( "branchside", "right" );
			break;
		default:
			( function () {
				if ( children.length < 5 ) {
					_node.setData( "x", parent.getData( "x" ) + 200 );
					_node.setData( "align", "left" );
					_node.setData( "branchside", "left" );
				} else {
					_node.setData( "x", parent.getData( "x" ) - 200 );
					_node.setData( "align", "right" );
					_node.setData( "branchside", "right" );
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
					return createChildNode( km, parent );
				} else {
					return false;
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