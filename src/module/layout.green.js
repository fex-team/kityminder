KityMinder.registerModule( "LayoutGreen", function () {
	var _target = this.getRenderTarget();
	var minderWidth = _target.clientWidth;
	var minderHeight = _target.clientHeight;
	var minder = this;
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
	var nodeDefautStyle = {
		radius: 10,
		fill: "green",
		stroke: "orange",
		strokeWidth: 1,
		color: "black",
		padding: [ 5, 10, 5, 10 ],
		fontSize: 20,
		margin: [ 0, 10, 10, 50 ]
	};
	var MinderNodeShape = kity.createClass( "MinderNodeShape", ( function () {
		return {
			constructor: function ( node ) {
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();
				this._node = node;
				var container = node.getRenderContainer();
				container.addShapes( [ rect, txt ] );
				var Layout = node.getData( "layout" );
				Layout.shape = this;
				var ND = JSON.parse( JSON.stringify( nodeDefautStyle ) );
				Layout.style = Utils.extend( ND, Layout.style );
				var _style = Layout.style;
				txt.setContent( node.getData( "text" ) || "新建节点" ).setSize( _style.fontSize ).fill( _style.color );
				var _txtHeight = txt.getHeight();
				txt.translate( _style.padding[ 3 ], _txtHeight + _style.padding[ 0 ] );
				this.update();
			},
			update: function () {
				var node = this._node;
				var txt = this._txt;
				var rect = this._rect;
				var _style = node.getData( "layout" ).style;
				txt.setContent( node.getData( "text" ) || "新建节点" ).setSize( _style.fontSize ).fill( _style.color );
				var _txtHeight = txt.getHeight();
				var _rectWidth = _style.padding[ 1 ] + _style.padding[ 3 ] + txt.getWidth();
				var _rectHeight = _style.padding[ 0 ] + _style.padding[ 2 ] + _txtHeight;
				rect.fill( _style.fill ).stroke( _style.stroke ).setRadius( _style.radius ).setWidth( _rectWidth ).setHeight( _rectHeight );
				if ( node.getData( "highlight" ) ) {
					rect.stroke( new kity.Pen( "white", 3 ) );
				} else {
					rect.stroke( new kity.Pen( _style.stroke, _style.strokeWidth ) );
				}
			}
		};
	} )() );
	var root = this.getRoot();
	//更新连线
	var updateConnect = function ( minder, node, action ) {
		var Layout = node.getData( "layout" );
		var _style = Layout.style;
		if ( !node.getParent() ) return false;
		var start = node.getParent().getRenderContainer();
		var end = node.getRenderContainer();
		var _connect = Layout.connect;
		if ( action === "remove" ) {
			_connect.remove();
		} else {
			if ( _connect ) _connect.updateConnection();
			else {
				_connect = new ConnectBezier( start, end );
				Layout.connect = _connect;
				minder.getRenderContainer().addShape( _connect );
				_connect.stroke( _style.stroke );
			}
		}
	};
	//求并集
	var uSet = function ( a, b ) {
		for ( var i = 0; i < a.length; i++ ) {
			var idx = b.indexOf( a[ i ] );
			if ( idx !== -1 ) {
				b.splice( idx, 1 );
			}
		}
		return a.concat( b );
	};
	//流程：绘制->计算Y坐标->计算X坐标->translate
	//绘制node
	var drawNode = function ( node ) {
		var container = node.getRenderContainer();
		var shape = node.getData( "layout" ).shape;
		if ( !shape ) new MinderNodeShape( node );
		else shape.update();
		updateConnect( minder, node );
	};

	//以某个节点为seed对整体高度进行更改计算
	var updateLayoutVertical = function ( node, parent, action ) {
		var effectSet = [ node ]; //用于返回受影响的节点集
		if ( !parent ) {
			return effectSet;
		}
		var Layout = node.getData( "layout" );
		var _style = Layout.style;
		var marginTop = _style.margin[ 0 ],
			marginBottom = _style.margin[ 2 ];
		var appendside = Layout.appendside;
		var branchheight = Layout.branchheight || node.getRenderContainer().getHeight() + marginTop + marginBottom;
		var countY = function ( node, appendside ) {
			var nodeLayout = node.getData( "layout" );
			var centerY = nodeLayout.y;
			var nodeBranchHeight = nodeLayout[ appendside + "Height" ] || nodeLayout.branchheight;
			var nodeChildren = nodeLayout[ appendside + "List" ] || node.getChildren();
			var sY = centerY - nodeBranchHeight / 2;
			if ( nodeChildren.length === 1 ) {
				var childrenLayout = nodeChildren[ 0 ].getData( "layout" );
				childrenLayout.y = centerY;
			} else {
				for ( var i = 0; i < nodeChildren.length; i++ ) {
					var childrenLayout1 = nodeChildren[ i ].getData( "layout" );
					if ( !childrenLayout1.shape ) break;
					var childBranchHeight = childrenLayout1.branchheight;
					childrenLayout1.y = sY + marginTop + childBranchHeight / 2;
					sY += childBranchHeight;
				}
			}
			return nodeChildren;
		};
		Layout.branchheight = branchheight;

		var parentLayout = parent.getData( "layout" );
		var siblings = parentLayout[ appendside + "List" ] || parent.getChildren();
		var getChildHeight = function ( node, appendside ) {
			var sum = 0;
			var nodeLayout = node.getData( "layout" );
			var children = nodeLayout[ appendside + "List" ] || node.getChildren();
			for ( var i = 0; i < children.length; i++ ) {
				var childLayout = children[ i ].getData( "layout" );
				if ( childLayout.shape ) sum += childLayout.branchheight;
			}
			return sum;
		};
		//方案：
		//增加节点时：1.节点和大于1
		//删除节点时：1.剩余节点和大于等于1
		//更新branchheight
		var prt = parent;
		do {
			var minH = prt.getRenderContainer().getHeight() + marginTop + marginBottom;
			var childH = getChildHeight( prt, appendside );
			var branchH = ( minH > childH ? minH : childH );
			var prtLayout = prt.getData( "layout" );

			if ( prt.getParent() ) {
				prtLayout.branchheight = branchH;
			} else {
				prtLayout[ appendside + "Height" ] = branchH;
			}
			prt = prt.getParent();
		} while ( prt );
		//遍历
		var _buffer = [ root ];
		while ( _buffer.length !== 0 ) {
			_buffer = _buffer.concat( countY( _buffer[ 0 ], appendside ) );
			effectSet.push( _buffer[ 0 ] );
			_buffer.shift();
		}

		return effectSet;
	};

	//以某个节点为seed对水平方向进行调整(包括调整子树)
	var updateLayoutHorizon = function ( node ) {
		var nodeLayout = node.getData( "layout" );
		var effectSet = [ node ]; //返回受影响（即需要进行下一步translate的节点）
		var parent = node.getParent();
		var appendside = nodeLayout.appendside;
		var selfWidth = node.getRenderContainer().getWidth();

		var countX = function ( n ) {
			var nLayout = n.getData( "layout" );
			var prt = n.getParent();
			var prtLayout = prt.getData( "layout" );
			var parentX = prtLayout.x;
			var parentWidth = prt.getRenderContainer().getWidth();
			var parentAlign = prtLayout.align;
			var selfAppendSide = nLayout.appendside;
			if ( parentAlign === "center" ) parentWidth = parentWidth / 2;
			var _style = nLayout.style;
			var marginLeft = _style.margin[ 3 ];
			var marginRight = _style.margin[ 1 ];
			switch ( selfAppendSide ) {
			case "left":
				nLayout.x = parentX - parentWidth - marginLeft - marginRight;
				break;
			case "right":
				nLayout.x = parentX + parentWidth + marginLeft + marginRight;
				break;
			default:
				break;
			}
		};

		//判断根据父节点位置定位还是自身已经带有位置属性
		if ( parent ) {
			countX( node );
		}
		//判断是否存在已绘制的孩子并对孩子位置进行调整(用于外部调用renderNode，如文本编时)
		// var _buffer = node.getChildren();
		// while ( _buffer.length !== 0 ) {
		// 	countX( _buffer[ 0 ] );
		// 	effectSet.push( _buffer[ 0 ] );
		// 	_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
		// 	_buffer.shift();
		// }
		return effectSet;
	};

	//调整node的位置
	var translateNode = function ( node ) {
		var Layout = node.getData( "layout" );
		var nodeShape = node.getRenderContainer();
		var align = Layout.align;
		var _rectHeight = nodeShape.getHeight();
		var _rectWidth = nodeShape.getWidth();
		switch ( align ) {
		case "right":
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x - _rectWidth, Layout.y - _rectHeight / 2 ) );
			break;
		case "center":
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x - _rectWidth / 2, Layout.y - _rectHeight / 2 ) );
			break;
		default:
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x, Layout.y - _rectHeight / 2 ) );
			break;
		}
	};
	var _style = {
		renderNode: function ( node ) {
			drawNode( node );
		},
		initStyle: function () {
			var _root = this.getRoot();
			var minder = this;
			var Layout = _root.getData( "layout" );
			Layout.style = {
				radius: 10,
				fill: "orange",
				stroke: "orange",
				color: "black",
				padding: [ 10, 10, 10, 10 ],
				fontSize: 30,
				margin: [ 0, 0, 0, 0 ]
			};
			Layout.x = minderWidth / 2;
			Layout.y = minderHeight / 2;
			Layout.align = "center";
			if ( !_root.getData( "text" ) ) _root.setData( "text", "I am the root" );
			Layout.appendside = "right";
			Layout.leftList = [];
			Layout.rightList = [];
			var _rootRenderContainer = _root.getRenderContainer();
			var rootHeight = _rootRenderContainer.getHeight();
			Layout.leftHeight = Layout.rightHeight = rootHeight;

			drawNode( _root );
			translateNode( _root );

			//如果是从其他style切过来的，需要重新布局
			var _buffer = _root.getChildren();
			while ( _buffer.length !== 0 ) {
				_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
				var prt = _buffer[ 0 ].getParent();
				_buffer[ 0 ].children = [];
				this.appendChildNode( prt, _buffer[ 0 ] );
				_buffer.shift();
			}
		},
		appendChildNode: function ( parent, node, index ) {
			if ( !node.getData( "layout" ) ) node.setData( "layout", {} );
			var Layout = node.getData( "layout" );
			var parentLayout = parent.getData( "layout" );
			var minder = this;
			if ( parent.getChildren().indexOf( node ) === -1 ) {
				if ( !index ) parent.appendChild( node );
				else parent.insertChild( node, index );
			}
			minder.handelNodeInsert( node );
			if ( parent === root ) {
				var leftList = parentLayout.leftList;
				var rightList = parentLayout.rightList;
				var sibling = parent.getChildren();
				var aside = Layout.appendside;
				if ( !aside ) {
					if ( sibling.length > 2 && rightList.length > leftList.length ) {
						aside = "left";
					} else {
						aside = "right";
					}
					Layout.appendside = aside;
				}
				parentLayout.appendside = aside;
				parentLayout[ aside + "List" ].push( node );
			}

			var appendside = parentLayout.appendside;
			Layout.appendside = appendside;
			if ( appendside === "left" ) {
				Layout.align = "right";
			} else {
				Layout.align = "left";
			}

			drawNode( node );
			var set1 = updateLayoutVertical( node, parent, "append" );
			var set2 = updateLayoutHorizon( node );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
			}
		},
		updateLayout: function ( node ) {
			var prt = node;
			prt.preTraverse( function ( n ) {

			} );
		},
		appendSiblingNode: function ( sibling, node ) {
			var siblingLayout = sibling.getData( "layout" );
			console.log( sibling );
			if ( !node.getData( "layout" ) ) {
				node.setData( "layout", {} );
			}
			var Layout = node.getData( "layout" );
			var parent = sibling.getParent();
			var index = sibling.getIndex() + 1;
			var appendside = siblingLayout.appendside;
			Layout.appendside = appendside;
			this.appendChildNode( parent, node, index );
		},
		removeNode: function ( nodes ) {
			var root = this.getRoot();
			var minder = this;
			for ( var i = 0; i < nodes.length; i++ ) {
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					var _buffer = [ nodes[ i ] ];
					var parentLayout = parent.getData( "layout" );
					while ( _buffer.length !== 0 ) {
						_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
						_buffer[ 0 ].getRenderContainer().remove();
						updateConnect( minder, _buffer[ 0 ], "remove" );
						_buffer.shift();
					}
					if ( parent === root ) {
						var Layout = nodes[ i ].getData( "layout" );
						var appendside = Layout.appendside;
						var sideList = parentLayout[ appendside + "List" ];
						var idx = sideList.indexOf( nodes[ i ] );
						sideList.splice( idx, 1 );
					}
					parent.removeChild( nodes[ i ] );
					var set = updateLayoutVertical( nodes[ i ], parent, "remove" );
					for ( var j = 0; j < set.length; j++ ) {
						translateNode( set[ j ] );
					}
				}
				minder.select( parent );
			}
		}
	};
	this.addLayoutStyle( "green", _style );
	return {};
} );