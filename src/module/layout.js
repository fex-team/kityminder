KityMinder.registerModule( "LayoutModule", function () {
	var defaultHeight = 25;
	//更新分支的高度信息
	var updateBranchHeight = function ( node, appendSide, root, isAdd, oldParent ) {
		var siblings = ( function () {
			if ( !isAdd ) {
				return oldParent.getChildren();
			} else if ( parent === root ) {
				return root.getData( "layer" + appendSide )[ 1 ];
			} else {
				return node.getParent().getChildren();
			}
		} )();
		console.log( siblings );
		if ( !isAdd && ( siblings.length === 0 || ( !oldParent.getParent() && oldParent !== root ) ) ) {
			return false;
		}
		var parent = isAdd ? node : oldParent;
		if ( isAdd ) {
			var add = ( ( siblings.length === 1 && node.getParent() !== root ) ? 0 : ( defaultHeight + 10 ) );
			console.log( add );
			do {
				var branchheight = parent.getData( appendSide + "Height" ) || parent.getData( "branchheight" ) || 0;
				if ( parent === root ) {
					parent.setData( appendSide + "Height", branchheight + add );
				} else {
					if ( parent === node ) {
						parent.setData( "branchheight", defaultHeight + 10 );
					} else {
						parent.setData( "branchheight", branchheight + add );
					}
				}
				parent = parent.getParent();
			} while ( parent || ( parent === root ) );
			if ( siblings.length === 1 ) {
				return false;
			} else {
				return true;
			}
		} else {
			var dec = node.getData( "branchheight" );
			do {
				var branchheight2 = parent.getData( appendSide + "Height" ) || parent.getData( "branchheight" ) || 0;
				if ( parent === root ) {
					parent.setData( appendSide + "Height", branchheight2 - dec );
				} else {
					parent.setData( "branchheight", branchheight2 - dec );
				}
				parent = parent.getParent();
			} while ( parent );
			return true;
		}
	};
	var reAnalyze = function ( km, layerArray, appendSide ) {
		for ( var lv = 0; lv < layerArray.length; lv++ ) {
			var lvData = layerArray[ lv ];
			for ( var i = 0; i < lvData.length; i++ ) {
				var children = ( lv === 0 ? layerArray[ 1 ] : lvData[ i ].getChildren() );
				if ( !children || children.length === 0 ) continue;
				var branchheight = lvData[ i ].getData( appendSide + "Height" ) || lvData[ i ].getData( "branchheight" );
				var sY = lvData[ i ].getData( "y" ) + ( children[ 0 ].getData( "branchheight" ) - branchheight ) / 2;
				for ( var j = 0; j < children.length; j++ ) {
					children[ j ].setData( "y", sY );
					var part1 = ( children[ j ].getData( "branchheight" ) - 10 ) / 2 + 10;
					var part2 = ( children[ j + 1 ] ? ( children[ j + 1 ].getData( "branchheight" ) - 10 ) / 2 : 0 );
					sY += ( part1 + part2 );
				}
				km.execCommand( "rendernode", children );
			}
		}
	};
	var createChildNode = function ( km, parent, index ) {
		var root = km.getRoot();
		var appendSide = parent.getData( "appendside" );
		var _node = new MinderNode();
		_node.setData( "branchheight", 0 );
		parent.insertChild( _node, index );

		_node.setData( "appendside", appendSide );
		if ( parent === root ) {
			var sidecount = root.getData( "sidecount" );
			if ( sidecount + 1 === 5 ) {
				root.setData( "sidecount", 0 );
				root.setData( "appendside", ( "leftright" ).replace( appendSide, "" ) );
			} else {
				root.setData( "sidecount", sidecount + 1 );
			}
		}
		var parentX = parent.getData( "x" );
		var parentWidth = parent.getRenderContainer().getWidth();

		switch ( appendSide ) {
		case "left":
			_node.setData( "x", parentX - parentWidth - 50 );
			_node.setData( "align", "right" );
			break;
		case "right":
			_node.setData( "x", parentX + parentWidth + 50 );
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
		_node.setData( "layer", layer );

		//遍历层级链
		var getIndexList = function ( node ) {
			var indexList = [];
			var parent = node;
			do {
				indexList.push( parent.getIndex() );
				parent = parent.getParent();
			} while ( parent );
			return indexList.reverse();
		};

		//比较两个层级链的大小
		var indexLarger = function ( List1, List2 ) {
			var larger = true;
			for ( var i = 0; i < List1.length; i++ ) {
				if ( List1[ i ] == List2[ i ] ) {
					continue;
				}
				if ( List1[ i ] < List2[ i ] ) {
					larger = false;
				}
				break;
			}
			return larger;
		};

		//选定合适的位置插入节点
		for ( var l = layerData.length - 1; l >= 0; l-- ) {
			var nodeIndexList = getIndexList( _node );
			if ( !indexLarger( getIndexList( layerData[ l ] ), nodeIndexList ) ) {
				insertPos = l + 1;
				break;
			}
		}

		layerData.splice( insertPos, 0, _node );
		var reAnal = updateBranchHeight( _node, appendSide, root, true );
		//判断是重绘全部还是只是添加节点
		if ( reAnal ) {
			reAnalyze( km, layerArray, appendSide );
		} else {
			_node.setData( "y", _node.getParent().getData( "y" ) );
			km.execCommand( "rendernode", _node );
		}
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
				var root = km.getRoot();
				for ( var i = 0; i < nodes.length; i++ ) {
					var parent = nodes[ i ].getParent();
					if ( parent ) {
						var appendSide = nodes[ i ].getData( "appendside" );
						var layer = nodes[ i ].getData( "layer" );
						parent.removeChild( nodes[ i ] );
						var layerArray = root.getData( "layer" + appendSide );
						var layerData = layerArray[ layer ];
						//移除层结构中的node
						for ( var j = 0; j < layerData.length; j++ ) {
							if ( layerData[ j ] === nodes[ i ] ) {
								layerData.splice( j, 1 );
								break;
							}
						}
						var reAnal = updateBranchHeight( nodes[ i ], appendSide, root, false, parent );
						console.log( layerArray );
						if ( reAnal ) {
							reAnalyze( km, layerArray, appendSide );
						}
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