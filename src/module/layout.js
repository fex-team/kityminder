KityMinder.registerModule( "LayoutModule", function () {

	var createChildNode = function ( km, parent, index ) {
		var defaultHeight = 25;
		var root = km.getRoot();
		var appendSide = parent.getData( "appendside" );
		if ( parent === root ) {
			var sidecount = root.getData( "sidecount" );
			if ( sidecount + 1 === 5 ) {
				root.setData( "sidecount", 0 );
				root.setData( "appendside", ( "leftright" ).replace( appendSide, "" ) );
			} else {
				root.setData( "sidecount", sidecount + 1 );
			}
		}
		var _node = new MinderNode();
		parent.insertChild( _node, index );
		_node.setData( "appendside", appendSide );
		var parentX = parent.getData( "x" );
		switch ( appendSide ) {
		case "left":
			_node.setData( "x", parentX - 200 );
			_node.setData( "align", "right" );
			break;
		case "right":
			_node.setData( "x", parentX + 200 );
			_node.setData( "align", "left" );
			break;
		default:
			break;
		}

		var layer = parent.getData( "layer" ) + 1;
		var layerArray = root.getData( "layer" + appendSide );
		layerArray[ layer ] = layerArray[ layer ] || [];
		var layerData = layerArray[ layer ];
		var insertPos = 0;

		layerData.splice( insertPos, 0, _node );
		_node.setData( "layer", layer );

		//设置各节点Y坐标
		var rootY = root.getData( "y" );
		var layerHeight = ( function () {
			var sum = 0;
			for ( var i = 0; i < layerData.length; i++ ) {
				sum += ( layerData[ i ].getRenderContainer().getHeight() );
			}
			return sum;
		} )() + defaultHeight / 2 - ( layerData[ 0 ].getRenderContainer().getHeight() || defaultHeight ) / 2 + ( layerData.length - 1 ) * 15;

		var sY = rootY - layerHeight / 2;
		for ( var j = 0; j < layerData.length; j++ ) {
			layerData[ j ].setData( "y", sY );
			var part1 = ( layerData[ j ].getRenderContainer().getHeight() || defaultHeight ) / 2 + 15;
			var part2 = layerData[ j + 1 ] ? ( layerData[ j + 1 ].getRenderContainer().getHeight() || defaultHeight ) / 2 : 0;
			if ( layerData[ j + 1 ] ) {
				console.log( layerData[ j + 1 ].getRenderContainer().getHeight() );
			}
			sY += ( part1 + part2 );
		}

		km.execCommand( "rendernode", layerData );
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
				var parent = sibling.getParent();
				var index = sibling.getIndex() + 1;
				if ( parent ) {
					return createChildNode( km, parent, index );
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