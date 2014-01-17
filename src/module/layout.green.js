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
				node.setData( "shape", this );
				var ND = JSON.parse( JSON.stringify( nodeDefautStyle ) );
				node.setData( "style", Utils.extend( ND, node.getData( "style" ) ) );
				var _style = node.getData( "style" );
				txt.setContent( node.getData( "text" ) || "新建节点" ).setSize( _style.fontSize ).fill( _style.color );
				var _txtHeight = txt.getHeight();
				txt.translate( _style.padding[ 3 ], _txtHeight + _style.padding[ 0 ] );
				this.update();
			},
			update: function () {
				var node = this._node;
				var txt = this._txt;
				var rect = this._rect;
				var _style = node.getData( "style" );
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
		var _style = node.getData( "style" );
		if ( !node.getParent() ) return false;
		var start = node.getParent().getRenderContainer();
		var end = node.getRenderContainer();
		var _connect = node.getData( "connect" );
		if ( action === "remove" ) {
			_connect.remove();
		} else {
			if ( _connect ) _connect.updateConnection();
			else {
				_connect = new ConnectBezier( start, end );
				node.setData( "connect", _connect );
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
	//绘制node
	var drawNode = function ( node ) {
		var container = node.getRenderContainer();
		var shape = node.getData( "shape" );
		if ( !shape ) new MinderNodeShape( node );
		else shape.update();
		updateConnect( minder, node );
	};

	//调整node的位置
	var translateNode = function ( node ) {
		var _style = node._style;
		var nodeShape = node.getRenderContainer();
		var align = node.getData( "align" );
		var _rectHeight = nodeShape.getHeight();
		var _rectWidth = nodeShape.getWidth();
		switch ( align ) {
		case "right":
			nodeShape.setTransform( new kity.Matrix().translate( node.getData( "x" ) - _rectWidth, node.getData( "y" ) - _rectHeight / 2 ) );
			break;
		case "center":
			nodeShape.setTransform( new kity.Matrix().translate( node.getData( "x" ) - _rectWidth / 2, node.getData( "y" ) - _rectHeight / 2 ) );
			break;
		default:
			nodeShape.setTransform( new kity.Matrix().translate( node.getData( "x" ), node.getData( "y" ) - _rectHeight / 2 ) );
			break;
		}
		updateConnect( minder, node );
	};

	//以某个节点为seed对整体高度进行更改计算
	var updateLayoutVertical = function ( node, parent, action ) {
		var effectSet = []; //用于返回受影响的节点集
		if ( !parent ) {
			return [ node ];
		}
		var _style = node.getData( "style" );
		var marginTop = _style.margin[ 0 ],
			marginBottom = _style.margin[ 2 ];
		var appendside = node.getData( "appendside" );
		var branchheight = node.getData( "branchheight" ) || node.getRenderContainer().getHeight() + marginTop + marginBottom;
		var countY = function ( node, appendside ) {
			var centerY = node.getData( "y" );
			var nodeBranchHeight = node.getData( appendside + "Height" ) || node.getData( "branchheight" );
			var nodeChildren = node.getData( appendside + "List" ) || node.getChildren();
			var sY = centerY - nodeBranchHeight / 2;
			for ( var i = 0; i < nodeChildren.length; i++ ) {
				var childBranchHeight = nodeChildren[ i ].getData( "branchheight" );
				nodeChildren[ i ].setData( "y", sY + marginTop + childBranchHeight / 2 );
				sY += childBranchHeight;
			}
			return nodeChildren;
		};

		if ( action !== "remove" ) {
			node.setData( "branchheight", branchheight );
		}
		var siblings = parent.getData( appendside + "List" ) || parent.getChildren();
		var getChildHeight = function ( node, appendside ) {
			var sum = 0;
			var children = node.getData( appendside + "List" ) || node.getChildren();
			for ( var i = 0; i < children.length; i++ ) {
				sum += children[ i ].getData( "branchheight" );
			}
			return sum;
		};
		//方案：
		//增加节点时：1.节点和大于1
		//删除节点时：1.剩余节点和大于等于1
		if ( ( action === "remove" && siblings.length > 0 ) || siblings.length > 1 ) {
			//更新branchheight
			var prt = parent;
			do {
				var minH = prt.getRenderContainer().getHeight() + marginTop + marginBottom;
				var childH = getChildHeight( prt, appendside );
				var branchH = ( minH > childH ? minH : childH );

				if ( prt.getParent() ) {
					prt.setData( "branchheight", branchH );
				} else {
					prt.setData( appendside + "Height", branchH );
				}
				prt = prt.getParent();
			} while ( prt );
			//遍历
			var effectRange = [ root ];
			var _buffer = effectRange;
			while ( _buffer.length !== 0 ) {
				_buffer = _buffer.concat( countY( _buffer[ 0 ], appendside ) );
				effectSet.push( _buffer[ 0 ] );
				_buffer.shift();
			}
		} else if ( action !== "remove" ) {
			node.setData( "y", parent.getData( "y" ) );
			effectSet = [ node ];
		}
		return effectSet;
	};

	//以某个节点为seed对水平方向进行调整
	var updateLayoutHorizon = function ( node ) {
		var effectSet = [];
		if ( !node.getParent() ) {
			return [ node ];
		}
		node.preTraverse( function ( n ) {
			var _style = n.getData( "style" );
			var parent = node.getParent();
			var _parentStyle = parent.getData( "style" );
			var parentX = parent.getData( "x" );
			var parentAlign = parent.getData( "align" );
			var parentWidth = parent.getRenderContainer().getWidth();
			if ( parentAlign === "center" ) parentWidth = parentWidth / 2;
			var selfAppendSide = n.getData( "appendside" );
			if ( selfAppendSide === "right" )
				n.setData( "x", parentX + parentWidth + _style.margin[ 3 ] + _parentStyle.margin[ 1 ] );
			else
				n.setData( "x", parentX - parentWidth - _style.margin[ 3 ] - _parentStyle.margin[ 1 ] );
			effectSet.push( n );
		} );
		return effectSet;
	};

	var updateArrangement = function ( node, action ) {
		var set1 = updateLayoutHorizon( node );
		var set2 = updateLayoutVertical( node, node.getParent(), action );
		//获取水平方向和垂直方向受影响的点的并集然后进行统一translate
		var set = uSet( set1, set2 );
		for ( var i = 0; i < set.length; i++ ) {
			translateNode( set[ i ] );
		}
	};
	var _style = {
		renderNode: function ( node ) {
			drawNode( node );
		},
		initStyle: function () {
			var _root = this.getRoot();
			var minder = this;
			_root.setData( "style", {
				radius: 10,
				fill: "green",
				stroke: "orange",
				color: "black",
				padding: [ 10, 10, 10, 10 ],
				fontSize: 30,
				margin: [ 0, 0, 0, 0 ]
			} );
			_root.setData( "x", minderWidth / 2 );
			_root.setData( "y", minderHeight / 2 );
			_root.setData( "layer", 0 );
			_root.setData( "align", "center" );
			_root.setData( "text", "I am the root" );

			_root.setData( "appendside", "right" );
			var children = _root.getChildren();
			_root.setData( "leftList", [] );
			_root.setData( "rightList", [] );

			minder.renderNode( _root );

			var _rootRenderContainer = _root.getRenderContainer();
			_root.setData( "leftHeight", _rootRenderContainer.getHeight() );
			_root.setData( "rightHeight", _rootRenderContainer.getHeight() );
			updateArrangement( _root );

			//如果是从其他style切过来的，需要重新布局
			if ( children.length !== 0 ) {
				_root.setData( "leftList", [] );
				_root.setData( "rightList", [] );
				var leftList = _root.getData( "leftList" );
				var rightList = _root.getData( "rightList" );
				for ( var i = 0; i < children.length; i++ ) {
					if ( i % 2 === 0 ) {
						rightList.push( children[ i ] );
						children[ i ].setData( "appendside", "right" );
					} else {
						leftList.push( children[ i ] );
						children[ i ].setData( "appendside", "left" );
					}
					drawNode( children[ i ] );
					updateArrangement( children[ i ] );
				}
			}
		},
		appendChildNode: function ( parent, node, index ) {
			var appendside = parent.getData( "appendside" );
			if ( parent === root ) {
				var leftList = parent.getData( "leftList" );
				var rightList = parent.getData( "rightList" );
				var sibling = parent.getChildren();
				if ( sibling.length >= 2 && rightList.length > leftList.length ) {
					appendside = "left";
				} else {
					appendside = "right";
				}
				parent.setData( "appendside", appendside );
				node.setData( "appendside", appendside );
				parent.getData( appendside + "List" ).push( node );
			}
			node.setData( "appendside", appendside );
			if ( appendside === "left" ) {
				node.setData( "align", "right" );
			} else {
				node.setData( "align", "left" );
			}
			if ( parent.getChildren().indexOf( node ) === -1 ) parent.appendChild( node, index );
			drawNode( node );
			updateArrangement( node, "append" );
		},
		appendSiblingNode: function ( sibling, node ) {
			var parent = sibling.getParent();
			var index = sibling.getIndex() + 1;
			var appendside = sibling.getData( "appendside" );
			node.setData( "appendside", appendside );
			this.appendChildNode( parent, node, index );
		},
		removeNode: function ( nodes ) {
			var root = this.getRoot();
			for ( var i = 0; i < nodes.length; i++ ) {
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					parent.removeChild( nodes[ i ] );
				}
			}
			this.setContentChanged( true );
		}
	};
	this.addLayoutStyle( "green", _style );
	return {};
} );