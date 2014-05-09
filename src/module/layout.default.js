KityMinder.registerModule( "LayoutDefault", function () {
	var _target = this.getRenderTarget();

	function getMinderSize() {
		return {
			width: _target.clientWidth,
			height: _target.clientHeight
		};
	}
	var minder = this;
	//收缩-展开子树的节点
	var ShIcon = kity.createClass( "DefaultshIcon", ( function () {
		return {
			constructor: function ( node ) {
				this._show = false;
				this._node = node;
				var iconShape = this.shape = new kity.Group();
				iconShape.class = "shicon";
				iconShape.icon = this;
				var circle = this._circle = new kity.Circle().fill( "white" ).stroke( "gray" ).setRadius( 5 );
				var plus = this._plus = new kity.Path();
				plus.getDrawer()
					.moveTo( -3, 0 )
					.lineTo( 3, 0 )
					.moveTo( 0, -3 )
					.lineTo( 0, 3 );
				plus.stroke( "gray" );
				var dec = this._dec = new kity.Path();
				dec.getDrawer()
					.moveTo( -3, 0 )
					.lineTo( 3, 0 );
				dec.stroke( "gray" );
				minder.getRenderContainer().addShape( iconShape );
				iconShape.addShapes( [ circle, plus, dec ] );
				this.update();
			},
			switchState: function ( val ) {
				if ( val === true || val === false )
					this._show = !val;
				if ( !this._show ) {
					this._plus.setOpacity( 0 );
					this._dec.setOpacity( 1 );
					this._show = true;
				} else {
					this._plus.setOpacity( 1 );
					this._dec.setOpacity( 0 );
					this._show = false;
				}
				return this._show;
			},
			update: function () {
				var node = this._node;
				var Layout = node.getLayout();
				var nodeShape = node.getRenderContainer();
				var nodeX, nodeY = ( node.getType() === "main" ? Layout.y : ( Layout.y + nodeShape.getHeight() / 2 - 5 ) );
				if ( Layout.appendside === "left" ) {
					nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x - 5;
				} else {
					nodeX = nodeShape.getRenderBox().closurePoints[ 0 ].x + 6;
					if ( node.getType() === "main" ) nodeX -= 3;
				}
				this.shape.setTranslate( nodeX, nodeY );
			},
			remove: function () {
				this.shape.remove();
			}
		};
	} )() );
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
	//样式的配置（包括颜色、字号等）
	var nodeStyles = {
		"root": {
			color: '#430',
			fill: '#e9df98',
			fontSize: 24,
			padding: [ 15.5, 25.5, 15.5, 25.5 ],
			margin: [ 0, 0, 0, 0 ],
			radius: 30,
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 3,
			spaceRight: 0,
			spaceTop: 3,
			spaceBottom: 3
		},
		"main": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			fill: '#A4c5c0',
			color: "#333",
			padding: [ 6.5, 20, 6.5, 20 ],
			fontSize: 16,
			margin: [ 0, 10, 30, 50 ],
			radius: 10,
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 5,
			spaceRight: 0,
			spaceTop: 2,
			spaceBottom: 2

		},
		"sub": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			color: "white",
			fontSize: 12,
			margin: [ 0, 10, 20, 6 ],
			padding: [ 5, 10, 5.5, 10 ],
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 4,
			spaceRight: 0,
			spaceTop: 2,
			spaceBottom: 2
		}
	};
	//更新背景
	var updateBg = function ( node ) {
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var Layout = node.getLayout();
		switch ( node.getType() ) {
		case "root":
		case "main":
			var bg = node.getBgRc().clear();
			bg.addShape( Layout.bgShadow = new kity.Rect() );
			bg.addShape( Layout.bgRect = new kity.Rect() );
			Layout.bgRect.fill( nodeStyle.fill ).setRadius( nodeStyle.radius );
			Layout.bgShadow.fill( 'black' ).setOpacity( 0.2 ).setRadius( nodeStyle.radius ).translate( 3, 5 );
			break;
		case "sub":
			var underline = Layout.underline = new kity.Path();
			var highlightshape = Layout.highlightshape = new kity.Rect().setRadius( 4 );
			node.getBgRc().clear().addShapes( [ Layout.bgRect = new kity.Rect().setRadius( 4 ), highlightshape, underline ] );
			break;
		default:
			break;
		}
	};
	//初始化样式
	var initLayout = function ( node ) {
		var Layout = node.getLayout();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		//var txtShape = node.getTextShape();
		//txtShape.fill( nodeStyle.color ).setSize( nodeStyle.fontSize ).setY( -3 );
		if ( nodeType === "root" ) {
			Layout.leftList = [];
			Layout.rightList = [];
			Layout.leftHeight = 0;
			Layout.rightHeight = 0;
		}
	};
	//根据内容调整节点尺寸
	var updateShapeByCont = function ( node ) {
		var contRc = node.getContRc();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var _contRCWidth = contRc.getWidth();
		var _contRCHeight = contRc.getHeight();
		var Layout = node.getLayout();
		switch ( nodeType ) {
		case "root":
		case "main":
			var width = _contRCWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ],
				height = _contRCHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ];
			Layout.bgRect.setWidth( width ).setHeight( height );
			Layout.bgShadow.setWidth( width ).setHeight( height );
			break;
		case "sub":
			var _contWidth = contRc.getWidth();
			var _contHeight = contRc.getHeight();
			width = _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ];
			height = _contHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ];
			Layout.underline.getDrawer()
				.clear()
				.moveTo( 0, _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] )
				.lineTo( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ], _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] );
			Layout.underline.stroke( nodeStyle.stroke );
			Layout.highlightshape
				.setWidth( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ] )
				.setHeight( _contHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
			Layout.bgRect.setWidth( width ).setHeight( height );
			break;
		default:
			break;
		}
		contRc.setTranslate( nodeStyle.padding[ 3 ], nodeStyle.padding[ 0 ] + _contRCHeight / 2 );
	};
	//计算节点在垂直方向的位置
	var updateLayoutVertical = function ( node, parent, action ) {
		var root = minder.getRoot();
		var effectSet = [ node ];
		if ( action === "remove" ) {
			effectSet = [];
		}
		var Layout = node.getLayout();
		var nodeShape = node.getRenderContainer();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var appendside = Layout.appendside;
		var countBranchHeight = function ( node, side ) {
			var nodeStyle = nodeStyles[ node.getType() ];
			var selfHeight = node.getRenderContainer().getHeight() + nodeStyle.margin[ 0 ] + nodeStyle.margin[ 2 ];
			var childHeight = ( function () {
				var sum = 0;
				var children;
				if ( !side ) {
					children = node.getChildren();
				} else {
					children = node.getLayout()[ side + "List" ];
				}
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getLayout();
					if ( children[ i ].getRenderContainer().getPaper() && children[ i ].getRenderContainer().getHeight() !== 0 )
						sum += childLayout.branchheight;
				}
				return sum;
			} )();
			if ( side ) {
				return childHeight;
			} else {
				return ( selfHeight > childHeight ? selfHeight : childHeight );
			}
		};
		if ( nodeType === "root" ) {
			Layout.y = getMinderSize().height / 2;
			effectSet.push( node );
		} else {
			if ( action === "append" || action === "contract" ) {
				var nodeHeight = node.getRenderContainer().getHeight() || ( node.getContRc().getHeight() + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
				Layout.branchheight = nodeHeight + nodeStyle.margin[ 0 ] + nodeStyle.margin[ 2 ];
			} else if ( action === "change" ) {
				Layout.branchheight = countBranchHeight( node );
			}
			var parentLayout = parent.getLayout();
			var parentShape = parent.getRenderContainer();
			var prt = node.getParent() || parent;
			//自底向上更新祖先元素的branchheight值
			while ( prt ) {
				var prtLayout = prt.getLayout();
				if ( prt.getType() === "root" ) {
					prtLayout[ appendside + "Height" ] = countBranchHeight( prt, appendside );
				} else {
					prtLayout.branchheight = countBranchHeight( prt );
				}
				prt = prt.getParent();
			}
		}
		//自顶向下更新受影响一侧的y值
		var updateSide = function ( appendside ) {
			var _buffer = [ root ];
			while ( _buffer.length > 0 ) {
				var _buffer0Layout = _buffer[ 0 ].getLayout();
				var children = _buffer0Layout[ appendside + "List" ] || _buffer[ 0 ].getChildren();
				var children = ( function () {
					var result = [];
					for ( var len = 0; len < children.length; len++ ) {
						var l = children[ len ].getLayout();
						if ( l.added ) {
							result.push( children[ len ] );
						}
					}
					return result;
				} )();
				_buffer = _buffer.concat( children );
				var sY = _buffer0Layout.y - ( _buffer0Layout[ appendside + "Height" ] || _buffer0Layout.branchheight ) / 2;
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getLayout();
					childLayout.y = sY + childLayout.branchheight / 2;
					sY += childLayout.branchheight;
				}
				if ( _buffer[ 0 ] !== root && _buffer[ 0 ].getLayout().added ) effectSet.push( _buffer[ 0 ] );
				_buffer.shift();
			}
		};
		var sideList;
		if ( appendside ) {
			updateSide( appendside );
		} else {
			updateSide( "left" );
			updateSide( "right" );
		}
		return effectSet;
	};
	//计算节点在水平方向的位置
	var updateLayoutHorizon = function ( node ) {
		var nodeType = node.getType();
		var parent = node.getParent();
		var effectSet = [ node ];
		var Layout = node.getLayout();
		var _buffer = [ node ];
		while ( _buffer.length !== 0 ) {
			var prt = _buffer[ 0 ].getParent();
			var children = _buffer[ 0 ].getChildren();
			children = ( function () {
				var result = [];
				for ( var len = 0; len < children.length; len++ ) {
					var l = children[ len ].getLayout();
					if ( l.added ) {
						result.push( children[ len ] );
					}
				}
				return result;
			} )();
			_buffer = _buffer.concat( children );
			if ( !prt ) {
				Layout.x = getMinderSize().width / 2;
				_buffer.shift();
				continue;
			}
			var parentLayout = prt.getLayout();
			var parentWidth = prt.getRenderContainer().getWidth();
			var parentStyle = nodeStyles[ prt.getType() ];
			var childLayout = _buffer[ 0 ].getLayout();
			var childStyle = nodeStyles[ _buffer[ 0 ].getType() ];
			if ( parentLayout.align === "center" ) {
				parentWidth = parentWidth / 2;
			}
			if ( childLayout.appendside === "left" ) {
				childLayout.x = parentLayout.x - parentWidth - parentStyle.margin[ 1 ] - childStyle.margin[ 3 ];
			} else {
				childLayout.x = parentLayout.x + parentWidth + parentStyle.margin[ 1 ] + childStyle.margin[ 3 ];
			}
			effectSet.push( _buffer[ 0 ] );
			_buffer.shift();
		}
		return effectSet;
	};
	var translateNode = function ( node ) {
		var Layout = node.getLayout();
		var nodeShape = node.getRenderContainer();
		var align = Layout.align;
		var _rectHeight = nodeShape.getHeight();
		var _rectWidth = nodeShape.getWidth();
		switch ( align ) {
		case "right":
			nodeShape.setTranslate( Layout.x - _rectWidth, Layout.y - _rectHeight / 2 );
			break;
		case "center":
			nodeShape.setTranslate( Layout.x - _rectWidth / 2, Layout.y - _rectHeight / 2 );
			break;
		default:
			nodeShape.setTranslate( Layout.x, Layout.y - _rectHeight / 2 );
			break;
		}
		node.setPoint( Layout.x, Layout.y );
	};
	var updateConnectAndshIcon = function ( node ) {
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var nodeStyle = nodeStyles[ node.getType() ];
		var connect;
		//更新连线
		if ( nodeType === "main" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Group();
				var bezier = Layout.connect.bezier = new kity.Bezier();
				var circle = Layout.connect.circle = new kity.Circle();
				connect.addShapes( [ bezier, circle ] );
				minder.getRenderContainer().addShape( connect );
				minder.getRoot().getRenderContainer().bringTop();
			}
			var parent = minder.getRoot();
			var rootX = parent.getLayout().x;
			var rootY = parent.getLayout().y;
			connect = Layout.connect;
			var nodeShape = node.getRenderContainer();
			var nodeClosurePoints = nodeShape.getRenderBox().closurePoints;
			var sPos;
			var endPos;
			if ( Layout.appendside === "left" ) {
				sPos = new kity.BezierPoint( rootX - 30, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 2 ].x + 3, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
			} else {
				sPos = new kity.BezierPoint( rootX + 30, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 3 ].x - 3, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
			}
			var sPosV = sPos.getVertex();
			var endPosV = endPos.getVertex();
			sPos.setVertex( rootX, rootY );
			connect.bezier.setPoints( [ sPos, endPos ] ).stroke( nodeStyle.stroke );
			connect.circle.setCenter( endPosV.x + ( Layout.appendside === "left" ? -0.5 : -1.5 ), endPosV.y ).fill( "white" ).setRadius( 4 );
		} else if ( nodeType === "sub" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Path();
				minder.getRenderContainer().addShape( connect );
			}
			connect = Layout.connect;
			var parentShape = node.getParent().getRenderContainer();
			var parentBox = parentShape.getRenderBox();
			var parentLayout = node.getParent().getLayout();
			var parentStyle = nodeStyles[ node.getParent().getType() ];
			var Shape = node.getRenderContainer();
			var sX, sY = parentLayout.y;
			var nodeX, nodeY = Shape.getRenderBox().closurePoints[ 1 ].y;
			if ( Layout.appendside === "left" ) {
				sX = parentBox.closurePoints[ 1 ].x - parentStyle.margin[ 1 ];
				nodeX = Shape.getRenderBox().closurePoints[ 0 ].x;
				connect.getDrawer()
					.clear()
					.moveTo( sX, sY )
					.lineTo( sX, nodeY > sY ? ( nodeY - nodeStyle.margin[ 3 ] ) : ( nodeY + nodeStyle.margin[ 3 ] ) );
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 1, nodeX, nodeY );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 0, nodeX, nodeY );
				connect.stroke( nodeStyle.stroke );
			} else {
				sX = parentBox.closurePoints[ 0 ].x + parentStyle.margin[ 1 ];
				nodeX = Shape.getRenderBox().closurePoints[ 1 ].x + 1;
				connect.getDrawer()
					.clear()
					.moveTo( sX, sY )
					.lineTo( sX, nodeY > sY ? ( nodeY - nodeStyle.margin[ 3 ] ) : ( nodeY + nodeStyle.margin[ 3 ] ) );
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 0, nodeX, nodeY );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 1, nodeX, nodeY );
				connect.stroke( nodeStyle.stroke );
			}
		}
		//更新收放icon
		if ( nodeType !== "root" && node.getChildren().length !== 0 ) {
			if ( !Layout.shicon ) {
				Layout.shicon = new ShIcon( node );
			}
			Layout.shicon.update();
		}
	};

	// var showNodeInView = function ( node ) {
	// 	// var padding = 5;
	// 	// var viewport = minder.getPaper().getViewPort();
	// 	// var offset = node.getRenderContainer().getRenderBox( minder.getRenderContainer() );

	// 	// var tmpX = viewport.center.x * 2 - ( offset.x + offset.width );
	// 	// var tmpY = viewport.center.y * 2 - ( offset.y + offset.height );

	// 	// var dx = offset.x < 0 ? -offset.x : Math.min( tmpX, 0 );
	// 	// var dy = offset.y < 0 ? -offset.y : Math.min( tmpY, 0 );

	// 	// minder.getRenderContainer().fxTranslate( dx, dy, 100, "easeOutQuint" );
	// };

	var _style = {
		getCurrentLayoutStyle: function () {
			return nodeStyles;
		},
		highlightNode: function ( node ) {
			var highlight = node.isHighlight();
			var nodeType = node.getType();
			var nodeStyle = nodeStyles[ nodeType ];
			var Layout = node.getLayout();
			switch ( nodeType ) {
			case "root":
			case "main":
				if ( highlight ) {
					Layout.bgRect.fill( nodeStyle.highlight );
				} else {
					Layout.bgRect.fill( nodeStyle.fill );
				}
				break;
			case "sub":
				if ( highlight ) {
					Layout.highlightshape.fill( nodeStyle.highlight ).setOpacity( 1 );
					node.getTextShape().fill( node.getData( 'fontcolor' ) || 'black' );
				} else {
					Layout.highlightshape.setOpacity( 0 );
					node.getTextShape().fill( node.getData( 'fontcolor' ) || 'white' );
				}
				break;
			default:
				break;
			}
		},
		updateLayout: function ( node ) {
			node.getContRc().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNode", {
				node: node
			}, false ) );
			updateShapeByCont( node );
			var set1 = updateLayoutHorizon( node );
			var set2 = updateLayoutVertical( node, node.getParent(), "change" );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
			if ( this.isNodeSelected( node ) ) {
				this.highlightNode( node )
			}
		},
		initStyle: function () {
			//渲染根节点
			var _root = minder.getRoot();
			var historyPoint = _root.getPoint();
			if ( historyPoint ) historyPoint = JSON.parse( JSON.stringify( historyPoint ) );
			minder.handelNodeInsert( _root );
			//设置root的align
			_root.getLayout().align = "center";
			updateBg( _root );
			initLayout( _root );
			_root.getContRc().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNode", {
				node: _root
			}, false ) );
			updateShapeByCont( _root );
			updateLayoutHorizon( _root );
			updateLayoutVertical( _root );
			translateNode( _root );
			if ( historyPoint ) _root.setPoint( historyPoint.x, historyPoint.y );
			//渲染首层节点
			var mains = _root.getChildren();
			for ( var i = 0; i < mains.length; i++ ) {
				this.appendChildNode( _root, mains[ i ] );
				if ( mains[ i ].isExpanded() && ( mains[ i ].getChildren().length > 0 ) ) {
					minder.expandNode( mains[ i ] );
				}
			}
			_root.setPoint( _root.getLayout().x, _root.getLayout().y );
		},
		expandNode: function ( ico ) {
			var isExpand, node;
			if ( ico instanceof MinderNode ) {
				node = ico;
				isExpand = node.getLayout().shicon.switchState();
			} else {
				isExpand = ico.icon.switchState();
				node = ico.icon._node;
			}
			var _buffer;
			if ( isExpand ) {
				node.expand();
				//遍历子树展开需要展开的节点
				_buffer = [ node ];
				while ( _buffer.length !== 0 ) {
					var c = _buffer[ 0 ].getChildren();
					if ( _buffer[ 0 ].isExpanded() && c.length !== 0 ) {
						for ( var x = 0; x < c.length; x++ ) {
							minder.appendChildNode( _buffer[ 0 ], c[ x ] );
						}
						_buffer = _buffer.concat( c );
					}
					_buffer.shift();
				}
			} else {
				node.collapse();
				//遍历子树移除需要移除的节点
				_buffer = node.getChildren();
				while ( _buffer.length !== 0 ) {
					var Layout = _buffer[ 0 ].getLayout();
					if ( Layout.added ) {
						Layout.added = false;
						_buffer[ 0 ].getRenderContainer().remove();
						Layout.connect.remove();
						if ( Layout.shicon ) Layout.shicon.remove();
					}
					_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
					_buffer.shift();
				}
				var set = updateLayoutVertical( node, node.getParent(), "contract" );
				for ( var i = 0; i < set.length; i++ ) {
					translateNode( set[ i ] );
					updateConnectAndshIcon( set[ i ] );
				}
			}
		},
		appendChildNode: function ( parent, node, focus, sibling ) {
			minder.handelNodeInsert( node );
			var Layout = node.getLayout();
			node.clearLayout();
			node.getContRc().clear();
			Layout = node.getLayout();
			Layout.added = true;
			var parentLayout = parent.getLayout();
			var children = parent.getChildren();
			var exist = ( children.indexOf( node ) !== -1 );
			if ( sibling ) {
				if ( !exist ) parent.insertChild( node, sibling.getIndex() + 1 );
				var siblingLayout = sibling.getLayout();
				Layout.appendside = siblingLayout.appendside;
				Layout.align = siblingLayout.align;
				if ( parent.getType() === "root" ) {
					minder.handelNodeInsert( node );
					var len = children.length;
					if ( len < 7 ) {
						if ( len % 2 ) {
							Layout.appendside = "right";
							Layout.align = "left";
						} else {
							Layout.appendside = "left";
							Layout.align = "right";
						}
					}
					var sideList = parentLayout[ Layout.appendside + "List" ];
					var idx = sideList.indexOf( sibling );
					sideList.splice( idx + 1, 0, node );
				}
			} else {
				if ( parent.getType() !== "root" ) {
					var prtLayout = parent.getLayout();
					Layout.appendside = prtLayout.appendside;
					Layout.align = prtLayout.align;
					if ( !exist ) parent.appendChild( node );
				} else {
					var nodeP = node.getPoint();
					if ( nodeP && nodeP.x && nodeP.y ) {
						if ( nodeP.x > parent.getPoint().x ) {
							Layout.appendside = "right";
							Layout.align = "left";
						} else {
							Layout.appendside = "left";
							Layout.align = "right";
						}
					} else {
						if ( parentLayout.rightList.length > 1 && parentLayout.rightList.length > parentLayout.leftList.length ) {
							Layout.appendside = "left";
							Layout.align = "right";
						} else {
							Layout.appendside = "right";
							Layout.align = "left";
						}
					}
					var sideList1 = parentLayout[ Layout.appendside + "List" ];
					sideList1.push( node );
					var idx1;
					if ( Layout.appendside === "right" ) {
						idx1 = sideList1.length;
					} else {
						idx1 = parent.getChildren().length;
					}
					if ( !exist ) parent.insertChild( node, idx1 );
				}
			}
			//设置分支类型
			if ( parent.getType() === "root" ) {
				node.setType( "main" );
			} else {
				node.setType( "sub" );
			}
			//计算位置等流程
			updateBg( node );
			initLayout( node );
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNode", {
				node: node
			}, false ) );
			updateShapeByCont( node );
			var set1 = updateLayoutVertical( node, parent, "append" );
			var set2 = updateLayoutHorizon( node );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}

			// if ( focus ) {
			// 	showNodeInView( node );
			// }
			parent.expand();
			var shicon = parent.getLayout().shicon;
			if ( shicon ) shicon.switchState( true );
		},
		appendSiblingNode: function ( sibling, node, focus ) {
			var parent = sibling.getParent();
			this.appendChildNode( parent, node, focus, sibling );
		},
		removeNode: function ( nodes ) {
			while ( nodes.length !== 0 ) {
				var parent = nodes[ 0 ].getParent();
				if ( !parent ) {
					nodes.splice( 0, 1 );
					return false;
				}
				var nodeLayout = nodes[ 0 ].getLayout();
				if ( parent.getType() === "root" ) {
					var sideList = parent.getLayout()[ nodeLayout.appendside + "List" ];
					var index = sideList.indexOf( nodes[ 0 ] );
					sideList.splice( index, 1 );
				}
				parent.removeChild( nodes[ 0 ] );
				if ( parent.getType() !== "root" && parent.getChildren().length === 0 ) {
					var prtLayout = parent.getLayout();
					prtLayout.shicon.remove();
					prtLayout.shicon = null;
				}
				var set = updateLayoutVertical( nodes[ 0 ], parent, "remove" );
				for ( var j = 0; j < set.length; j++ ) {
					translateNode( set[ j ] );
					updateConnectAndshIcon( set[ j ] );
				}
				var _buffer = [ nodes[ 0 ] ];
				while ( _buffer.length !== 0 ) {
					_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
					try {
						_buffer[ 0 ].getRenderContainer().remove();
						var Layout = _buffer[ 0 ].getLayout();
						Layout.connect.remove();
						Layout.shicon.remove();
					} catch ( error ) {
						console.log( "isRemoved" );
					}
					//检测当前节点是否在选中的数组中，如果在的话，从选中数组中去除
					var idx = nodes.indexOf( _buffer[ 0 ] );
					if ( idx !== -1 ) {
						nodes.splice( idx, 1 );
					}
					_buffer.shift();
				}
			}
		}
	};
	this.addLayoutStyle( "default", _style );
	return {};
} );