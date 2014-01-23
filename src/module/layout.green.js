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
		fill: "beige",
		stroke: "orange",
		strokeWidth: 1,
		color: "black",
		padding: [ 5, 10, 5, 10 ],
		fontSize: 20,
		margin: [ 50, 5, 0, 5 ]
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
	var updateLayoutVertical = function ( node ) {
		var Layout = node.getData( "layout" );
		var parent = node.getParent();
		var parentLayout = parent.getData( "layout" );
		var effectSet = [];
		var parentHeight = parent.getRenderContainer().getHeight();
		var _style = Layout.style;
		var parentY = parentLayout.y;
		var marginTop = _style.margin[ 0 ];
		var marginBottom = _style.margin[ 2 ];
		Layout.y = parentY + parentHeight / 2 + marginTop + marginBottom;
		effectSet.push( node );
		return effectSet;
	};

	//以某个节点为seed对水平方向进行调整
	var updateLayoutHorizon = function ( node, parent ) {
		var effectSet = [];
		var Layout = node.getData( "layout" );
		var _style = Layout.style;
		var marginLeft = _style.margin[ 3 ];
		var marginRight = _style.margin[ 1 ];
		var nodeWidth = node.getRenderContainer().getWidth();
		Layout.branchwidth = nodeWidth + marginLeft + marginRight;
		var prt = parent;
		while ( prt ) {
			var children = prt.getChildren();
			var parentWidth = prt.getRenderContainer().getWidth() + marginLeft + marginRight;
			var sum = 0;
			for ( var i = 0; i < children.length; i++ ) {
				sum += children[ i ].getData( "layout" ).branchwidth;
			}
			var prtLayout = prt.getData( "layout" );
			prtLayout.branchwidth = ( sum > parentWidth ? sum : parentWidth );
			prtLayout.childrenwidth = sum;
			prt = prt.getParent();
		}

		var _buffer = [ minder.getRoot() ];
		while ( _buffer.length !== 0 ) {
			var childrenC = _buffer[ 0 ].getChildren();
			var parentLayout = _buffer[ 0 ].getData( "layout" );
			var parentX = parentLayout.x;
			var parentChildrenWidth = parentLayout.childrenwidth;
			var sX = parentX - parentChildrenWidth / 2;
			for ( var j = 0; j < childrenC.length; j++ ) {
				var layoutC = childrenC[ j ].getData( "layout" );
				layoutC.x = sX + layoutC.branchwidth / 2;
				sX += layoutC.branchwidth;
			}
			_buffer = _buffer.concat( childrenC );
			effectSet.push( _buffer[ 0 ] );
			_buffer.shift();
		}
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
			//绘制root并且调整到正确位置
			var _root = this.getRoot();
			this.getRenderContainer().clear().addShape( _root.getRenderContainer().clear() );
			var minder = this;
			_root.setData( "text", _root.getData( "text" ) || "I am the root" );
			_root.setData( "layout", {} );
			var Layout = _root.getData( "layout" );
			Layout.style = {
				radius: 20,
				fill: "darkgreen",
				stroke: "orange",
				color: "black",
				padding: [ 10, 10, 10, 10 ],
				fontSize: 30,
				margin: [ 0, 5, 0, 5 ]
			};
			Layout.x = minderWidth / 2;
			Layout.y = 50;
			Layout.align = "center";
			drawNode( _root );
			translateNode( _root );

			var _buffer = _root.getChildren();
			_root.children = [];
			while ( _buffer.length !== 0 ) {
				var parent = _buffer[ 0 ].getParent();
				_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
				_buffer[ 0 ].children = [];
				_buffer[ 0 ].setData( "layout", {} );
				this.appendChildNode( parent, _buffer[ 0 ] );
				_buffer.shift();
			}
		},
		appendChildNode: function ( parent, node, index ) {
			node.setData( "layout", {} );
			var Layout = node.getData( "layout" );
			var parentLayout = parent.getData( "layout" );
			var minder = this;
			if ( parent.getChildren().indexOf( node ) === -1 ) {
				if ( !index ) parent.appendChild( node );
				else parent.insertChild( node, index );
			}
			minder.handelNodeInsert( node );
			drawNode( node );
			Layout.align = "center";
			//调整影响到的节点位置
			var set1 = updateLayoutVertical( node );
			var set2 = updateLayoutHorizon( node, parent );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
			}
		},
		appendSiblingNode: function ( sibling, node ) {
			var parent = sibling.getParent();
			var index = sibling.getIndex() + 1;
			this.appendChildNode( parent, node, index );
		},
		removeNode: function ( nodes ) {
			var root = this.getRoot();
			var minder = this;
			for ( var i = 0; i < nodes.length; i++ ) {
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					nodes[ i ].getRenderContainer().remove();
					updateConnect( minder, nodes[ i ], "remove" );
					parent.removeChild( nodes[ i ] );
					updateLayoutHorizon( parent, nodes[ i ] );
				}
			}
		},
		updateLayout: function ( node ) {

		}
	};
	this.addLayoutStyle( "green", _style );
	return {};
} );