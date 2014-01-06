KityMinder.registerModule( "LayoutModule", function () {
	var createChildNode = function ( km, parent ) {
		var children = parent.getChildren();

		var judgeDir = function ( num ) {
			var devide = parseInt( num / 5 );
			if ( devide % 2 ) {
				return "left";
			} else {
				return "right";
			}
		};
		var branchside = parent.getData( "branchside" ) || judgeDir( children.length );
		var _node = new MinderNode();
		_node.setData( "y", parent.getData( "y" ) + Math.random() * 100 - 100 );
		_node.setData( "text", "New Node" );
		switch ( branchside ) {
		case "left":
			_node.setData( "branchside", "left" );
			_node.setData( "x", parent.getData( "x" ) - 200 );
			break;
		case "right":
			_node.setData( "x", parent.getData( "x" ) + 200 );
			_node.setData( "branchside", "right" );
			break;
		default:
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
			execute: function ( km, nodes ) {
				for ( var i = 0; i < nodes.length; i++ ) {
					var parent = nodes[ i ].getParent();
					if ( parent ) {
						parent.removeChild( nodes[ i ] );
					}
				}
				this.setContentChanged( true );
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