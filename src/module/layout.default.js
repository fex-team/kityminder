KityMinder.registerModule( "LayoutDefault", function () {
	var defaultHeight = 35;
	var _target = this.getRenderTarget();
	var minderWidth = _target.clientWidth;
	var minderHeight = _target.clientHeight;

	var ConnectBezier = kity.createClass( "ConnectBezier", ( function () {
		function mid( a, b ) {
			return ( a + b ) / 2;
		}

		function getSnapPoints( snaper ) {
			if ( snaper.getSnapPoints ) {
				return snaper.getSnapPoints();
			}
			var box = snaper.getRenderBox();
			var x1 = box.x,
				x2 = box.x + box.width,
				y1 = box.y,
				y2 = box.y + box.height,
				xm = mid( x1, x2 ),
				ym = mid( y1, y2 );
			return [ {
					x: xm,
					y: y1,
					type: 'top'
				}, // top
				{
					x: x2,
					y: ym,
					type: 'right'
				}, // right
				{
					x: xm,
					y: y2,
					type: 'bottom'
				}, // bottom
				{
					x: x1,
					y: ym,
					type: 'left'
				} // left
			];
		}
		var DIR_NORMALS = {
			top: new kity.Vector( 0, -1 ),
			left: new kity.Vector( -1, 0 ),
			bottom: new kity.Vector( 0, 1 ),
			right: new kity.Vector( 1, 0 )
		};

		function fillNormal( snapPoint ) {
			if ( snapPoint.normal ) {
				return;
			}
			snapPoint.normal = DIR_NORMALS[ snapPoint.type ] || DIR_NORMALS.left;
		}
		return {
			base: kity.Bezier,
			constructor: function ( start, end ) {
				this.callBase();
				this.setStartSnaper( start );
				this.setEndSnaper( end );
				this.init();
				this.updateConnection();
			},
			init: function () {
				this.addPoint( this.startBesierPoint = new kity.BezierPoint() );
				this.addPoint( this.endBesierPoint = new kity.BezierPoint() );
			},
			bindSnaper: function ( snaper ) {
				var me = this;
				snaper.on( 'shapeupdate', function () {
					me.updateConnection();
				} );
			},
			setStartSnaper: function ( snaper ) {
				this.start = snaper;
				this.bindSnaper( snaper );
			},
			setEndSnaper: function ( snaper ) {
				this.end = snaper;
				this.bindSnaper( snaper );
			},
			isReady: function () {
				return !!( this.start && this.end );
			},
			calcEndPoints: function () {
				var startEnds = getSnapPoints( this.start ),
					endEnds = getSnapPoints( this.end );
				var nearStart, nearEnd, minDistance = Number.MAX_VALUE;
				var i, j, startEnd, endEnd, distance;

				// 寻找最近的粘附点
				// 暴力解法：可优化但不必要，因为点集不会很大
				for ( i = 0; i < startEnds.length; i++ ) {
					for ( j = 0; j < endEnds.length; j++ ) {
						distance = Math.abs( startEnds[ i ].x - endEnds[ j ].x ) + Math.abs( startEnds[ i ].y - endEnds[ j ].y ) * 0.5; //Vector.fromPoints( startEnds[i], endEnds[j] ).length();
						if ( distance < minDistance ) {
							minDistance = distance;
							nearStart = startEnds[ i ];
							nearEnd = endEnds[ j ];
						}
					}
				}
				return {
					start: nearStart,
					end: nearEnd
				};
			},
			updateConnection: function () {
				if ( !this.isReady() ) {
					return false;
				}
				var endPoints = this.calcEndPoints(),
					startEnd = endPoints.start,
					endEnd = endPoints.end;

				fillNormal( startEnd );
				fillNormal( endEnd );

				var pointVector = kity.Vector.fromPoints( startEnd, endEnd );

				var forward = kity.Vector.projection( pointVector, startEnd.normal );
				var backward = kity.Vector.projection( kity.Vector.reverse( pointVector ), endEnd.normal );

				forward = kity.Vector.multipy( forward, 0.5 );
				forward = kity.Vector.add( startEnd, forward );
				backward = kity.Vector.multipy( backward, 0.5 );
				backward = kity.Vector.add( endEnd, backward );

				this.startBesierPoint.setVertex( startEnd.x, startEnd.y );
				this.startBesierPoint.setForward( forward.x, forward.y );

				this.endBesierPoint.setVertex( endEnd.x, endEnd.y );
				this.endBesierPoint.setBackward( backward.x, backward.y );
			}
		};
	} )() );

	var updateConnect = function ( minder, nodes, action ) {
		switch ( action ) {
		case "rendernode":
			( function () {
				if ( !( nodes instanceof Array ) ) {
					nodes = [ nodes ];
				}
				for ( var i = 0; i < nodes.length; i++ ) {
					var curnode = nodes[ i ];
					if ( !curnode.getParent() ) {
						return false;
					} else {
						var parent = curnode.getParent();
						var connectExist = curnode.getData( "connect" );
						if ( connectExist ) {
							connectExist.updateConnection();
						} else {
							var _connect = new ConnectBezier( parent.getRenderContainer(), curnode.getRenderContainer() );
							var nodeD = curnode.getData( "style" );
							_connect.stroke( new kity.Pen( nodeD.stroke, nodeD.strokeWidth ) );
							curnode.setData( "connect", _connect );
							minder.getRenderContainer().addShape( _connect );
						}
					}
				}
			} )();
			break;
		case "removenode":
			( function () {
				if ( ( nodes instanceof Array ) === false ) {
					nodes = [ nodes ];
				}

				function removeConnect( node ) {
					var connect = node._connect;
					if ( connect && connect.remove ) {
						connect.remove();
					}
				}
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].traverse( removeConnect );
				}
			} )();
		}
	};

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
		var parent = isAdd ? node.getParent() : oldParent;
		node.setData( "branchheight", defaultHeight + 10 );
		if ( isAdd ) {
			var add = ( ( siblings.length === 1 && node.getParent() !== root ) ? 0 : ( defaultHeight + 10 ) );
			while ( parent || ( parent === root ) ) {
				var branchheight = parent.getData( appendSide + "Height" ) || parent.getData( "branchheight" ) || 0;
				if ( parent === root ) {
					parent.setData( appendSide + "Height", branchheight + add );
				} else {
					parent.setData( "branchheight", branchheight + add );
				}
				parent = parent.getParent();
			}

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
				km.renderNodes( children );
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

		var parentX = parent.getData( "x" );
		var parentWidth = parent.getRenderContainer().getWidth();
		if ( parent.getData( "align" ) === "center" ) parentWidth = parentWidth / 2;

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

		if ( parent === root ) {
			var leftCount = parent.getData( "layerleft" );
			var rightCount = parent.getData( "layerright" );
			leftCount = leftCount[ 1 ] ? leftCount[ 1 ].length : 0;
			rightCount = rightCount[ 1 ] ? rightCount[ 1 ].length : 0;
			if ( rightCount > leftCount && rightCount > 1 ) {
				parent.setData( "appendside", "left" );
			} else {
				parent.setData( "appendside", "right" );
			}
		}

		var reAnal = updateBranchHeight( _node, appendSide, root, true );
		//判断是重绘全部还是只是添加节点
		if ( reAnal ) {
			reAnalyze( km, layerArray, appendSide );
		} else {
			_node.setData( "y", _node.getParent().getData( "y" ) );
			km.renderNode( _node );
		}
		return _node;
	};

	var setX = function ( node ) {
		var parent = node.getParent();
		if ( !parent ) return false;
		var parentX = parent.getData( "x" );
		var parentWidth = parent.getRenderContainer().getWidth();
		if ( parent.getData( "align" ) === "center" ) {
			parentWidth = parentWidth / 2;
		}
		var side = node.getData( "appendside" );
		if ( side === "left" ) {
			node.setData( "x", parentX - parentWidth - 50 );
		} else {
			node.setData( "x", parentX + parentWidth + 50 );
		}
	};
	var _style = {
		renderNode: function ( node ) {
			var km = this;
			var styledefault = {
				radius: 10,
				fill: "yellow",
				stroke: "orange",
				color: "black",
				padding: [ 5, 10, 5, 10 ],
				fontSize: 20
			};
			var MinderNodeShape = kity.createClass( "MinderNodeShape", ( function () {
				return {
					constructor: function ( container ) {
						this.rect = new kity.Rect();
						this.text = new kity.Text();
						this.shape = new kity.Group();
						this.shape.addShapes( [ this.rect, this.text ] );
						container.addShape( this.shape, "nodeShape" );
					},
					highlight: function () {
						this.rect.stroke( new kity.Pen( "white", 3 ) );
					},
					unhighlight: function () {
						this.rect.stroke( this.NormalInfo );
					}
				};
			} )() );

			var kR = node.getRenderContainer();
			var nodeShape = node.getData( "nodeshape" ) || new MinderNodeShape( kR );
			node.setData( "nodeshape", nodeShape );
			var nd = JSON.parse( JSON.stringify( styledefault ) );
			var nodeD = Utils.extend( nd, node.getData( "style" ) );
			node.setData( "style", nodeD );
			var _style = nodeD;
			nodeShape.text
				.setContent( node.getData( "text" ) || "Node" )
				.setSize( nodeD.fontSize )
				.fill( nodeD.color );
			var txtWidth = nodeShape.text.getWidth();
			var txtHeight = nodeShape.text.getHeight();
			var _padding = _style.padding;

			var _rectWidth = txtWidth + _padding[ 1 ] + _padding[ 3 ];
			var _rectHeight = txtHeight + _padding[ 0 ] + _padding[ 2 ];
			nodeShape.text
				.setX( _padding[ 3 ] ).setY( _padding[ 0 ] + txtHeight );

			nodeShape.NormalInfo = new kity.Pen( _style.stroke, _style.strokeWidth );
			nodeShape.rect.setWidth( _rectWidth ).setHeight( _rectHeight ).stroke( nodeShape.NormalInfo ).fill( _style.fill ).setRadius( _style.radius );
			switch ( node.getData( "align" ) ) {
			case "center":
				nodeShape.shape.setTransform( new kity.Matrix().translate( node.getData( "x" ) - _rectWidth / 2, node.getData( "y" ) - _rectHeight / 2 ) );
				break;
			case "right":
				nodeShape.shape.setTransform( new kity.Matrix().translate( node.getData( "x" ) - _rectWidth, node.getData( "y" ) - _rectHeight / 2 ) );
				break;
			default:
				nodeShape.shape.setTransform( new kity.Matrix().translate( node.getData( "x" ), node.getData( "y" ) - _rectHeight / 2 ) );
				break;
			}
			if ( node.getData( "highlight" ) ) {
				nodeShape.highlight();
			} else {
				nodeShape.unhighlight();
			}
			updateConnect( this, node, "rendernode" );
		},
		initStyle: function () {
			var _root = this.getRoot();
			var minder = this;
			_root.setData( "style", {
				radius: 10,
				fill: "orange",
				stroke: "orange",
				color: "black",
				padding: [ 10, 10, 10, 10 ],
				fontSize: 30
			} );
			_root.setData( "x", minderWidth / 2 );
			_root.setData( "y", minderHeight / 2 );
			_root.setData( "layer", 0 );
			_root.setData( "align", "center" );
			_root.setData( "text", "I am the root" );
			//标记左子树和右子树的元素
			_root.setData( "layerleft", [
				[ _root ]
			] );
			_root.setData( "layerright", [
				[ _root ]
			] );
			_root.setData( "indexList", [ 0 ] );
			_root.setData( "leftHeight", 0 );
			_root.setData( "rightHeight", 0 );

			//标记根节点以及添加子树的方向
			_root.setData( "appendside", "right" );
			_root.preTraverse( function ( node ) {
				minder.renderNode( node );
			} );
		},
		createChildNode: function ( parent ) {
			return createChildNode( this, parent );
		},
		createSiblingNode: function ( sibling ) {
			var root = this.getRoot();
			var parent = sibling.getParent();
			if ( parent === root ) {
				parent.setData( "appendside", sibling.getData( "appendside" ) );
			}
			var index = sibling.getIndex() + 1;
			if ( parent ) {
				return createChildNode( this, parent, index );
			} else {
				return false;
			}
		},
		removeNode: function ( nodes ) {
			var root = this.getRoot();
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
					if ( reAnal ) {
						reAnalyze( this, layerArray, appendSide );
					}
				}
			}
			updateConnect( this, nodes, "removenode" );
		}
	};
	this.addLayoutStyle( "default", _style );
	return {};
} );