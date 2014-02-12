KityMinder.registerModule( "LayoutDefault", function () {
	var _target = this.getRenderTarget();
	var minderWidth = _target.clientWidth;
	var minderHeight = _target.clientHeight;
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
				node.setData( "shicon", this );
				this.update();
				this.switchState();
			},
			switchState: function () {
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
				var Layout = node.getData( "layout" );
				var nodeShape = node.getRenderContainer();
				var nodeX, nodeY = ( node.getType() === "main" ? Layout.y : ( Layout.y + nodeShape.getHeight() / 2 - 5 ) );
				if ( Layout.appendside === "left" ) {
					nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x - 6;
				} else {
					nodeX = nodeShape.getRenderBox().closurePoints[ 0 ].x + 6;
				}
				this.shape.setTransform( new kity.Matrix().translate( nodeX, nodeY ) );
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
			color: "white",
			fill: "cadetblue",
			fontSize: 20,
			padding: [ 10.5, 10, 10.5, 10 ],
			margin: [ 0, 0, 0, 0 ],
			radius: 15,
			highlight: "chocolate"
		},
		"main": {
			fill: "white",
			color: "#333",
			padding: [ 5.5, 20, 5.5, 20 ],
			fontSize: 14,
			margin: [ 0, 10, 30, 50 ],
			radius: 5,
			highlight: "chocolate"
		},
		"sub": {
			stroke: new kity.Pen( "white", 1 ).setLineCap( "round" ).setLineJoin( "round" ),
			color: "white",
			fontSize: 12,
			margin: [ 0, 10, 20, 5 ],
			padding: [ 5, 10, 5.5, 10 ],
			highlight: "chocolate"
		}
	};
	//更新背景
	var updateBg = function ( node ) {
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var Layout = node.getData( "layout" );
		switch ( node.getType() ) {
		case "root":
		case "main":
			if ( !Layout.bgRect ) {
				node.getBgRc().addShape( Layout.bgRect = new kity.Rect() );
			}
			Layout.bgRect.fill( nodeStyle.fill ).setRadius( nodeStyle.radius );
			break;
		case "sub":
			var underline = Layout.underline = new kity.Path();
			var highlightshape = Layout.highlightshape = new kity.Rect();
			node.getBgRc().addShapes( [ highlightshape, underline ] );
			break;
		default:
			break;
		}
	};
	//初始化样式
	var initLayout = function ( node ) {
		var Layout = node.getData( "layout" ) || {};
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var txtShape = node.getTextShape();
		txtShape.fill( nodeStyle.color ).setSize( nodeStyle.fontSize );
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
		var Layout = node.getData( "layout" );
		switch ( nodeType ) {
		case "root":
		case "main":
			Layout.bgRect.setWidth( _contRCWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ] );
			Layout.bgRect.setHeight( _contRCHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
			break;
		case "sub":
			var _contWidth = contRc.getWidth();
			var _contHeight = contRc.getHeight();
			Layout.underline.getDrawer()
				.clear()
				.moveTo( 0, _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] )
				.lineTo( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ], _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] );
			Layout.underline.stroke( nodeStyle.stroke );
			Layout.highlightshape
				.setWidth( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ] )
				.setHeight( _contHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
			break;
		default:
			break;
		}
		contRc.setTransform( new kity.Matrix().translate( nodeStyle.padding[ 3 ], nodeStyle.padding[ 0 ] + node.getTextShape().getHeight() ) );
	};
	//计算节点在垂直方向的位置
	var updateLayoutVertical = function ( node, parent, action ) {
		var root = minder.getRoot();
		var effectSet = [ node ];
		var Layout = node.getData( "layout" );
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
					children = node.getData( "layout" )[ side + "List" ];
				}
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getData( "layout" );
					if ( children[ i ].getRenderContainer().getHeight() !== 0 )
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
			Layout.y = minderHeight / 2;
			effectSet.push( node );
		} else {
			if ( action === "append" || action === "contract" ) {
				Layout.branchheight = node.getRenderContainer().getHeight() + nodeStyle.margin[ 0 ] + nodeStyle.margin[ 2 ];
			} else if ( action === "expand" || action === "change" ) { //展开
				Layout.branchheight = countBranchHeight( node );
			}
			var parentLayout = parent.getData( "layout" );
			var parentShape = parent.getRenderContainer();
			var prt = node.getParent() || parent;
			//自底向上更新祖先元素的branchheight值
			while ( prt ) {
				var prtLayout = prt.getData( "layout" );
				if ( prt.getType() === "root" ) {
					prtLayout[ appendside + "Height" ] = countBranchHeight( prt, appendside );
				} else {
					prtLayout.branchheight = countBranchHeight( prt );
				}
				prt = prt.getParent();
			}
			//自顶向下更新受影响一侧的y值
			var sideList = root.getData( "layout" )[ appendside + "List" ];
			var _buffer = [ root ];
			while ( _buffer.length > 0 ) {
				var _buffer0Layout = _buffer[ 0 ].getData( "layout" );
				var children = _buffer0Layout[ appendside + "List" ] || _buffer[ 0 ].getChildren();
				_buffer = _buffer.concat( children );
				var sY = _buffer0Layout.y - ( _buffer0Layout[ appendside + "Height" ] || _buffer0Layout.branchheight ) / 2;
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getData( "layout" );
					childLayout.y = sY + childLayout.branchheight / 2;
					sY += childLayout.branchheight;
				}
				effectSet.push( _buffer[ 0 ] );
				_buffer.shift();
			}
		}
		return effectSet;
	};
	//计算节点在水平方向的位置
	var updateLayoutHorizon = function ( node ) {
		var nodeType = node.getType();
		var parent = node.getParent();
		var effectSet = [ node ];
		var Layout = node.getData( "layout" );
		var _buffer = [ node ];
		while ( _buffer.length !== 0 ) {
			var prt = _buffer[ 0 ].getParent();
			_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
			if ( !prt ) {
				Layout.x = minderWidth / 2;
				_buffer.shift();
				continue;
			}
			var parentLayout = prt.getData( "layout" );
			var parentWidth = prt.getRenderContainer().getWidth();
			var parentStyle = nodeStyles[ prt.getType() ];
			var childLayout = _buffer[ 0 ].getData( "layout" );
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
	var updateConnectAndshIcon = function ( node ) {
		var nodeType = node.getType();
		var Layout = node.getData( "layout" );
		var connect;
		//更新连线
		if ( nodeType === "main" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Group();
				var bezier = Layout.connect.bezier = new kity.Bezier();
				var circle = Layout.connect.circle = new kity.Circle();
				connect.addShapes( [ bezier, circle ] );
				minder.getRenderContainer().addShape( connect ).bringTop( minder.getRoot().getRenderContainer() );
			}
			var parent = minder.getRoot();
			var rootX = parent.getData( "layout" ).x;
			var rootY = parent.getData( "layout" ).y;
			connect = Layout.connect;
			var nodeShape = node.getRenderContainer();
			var nodeClosurePoints = nodeShape.getRenderBox().closurePoints;
			var sPos;
			var endPos;
			if ( Layout.appendside === "left" ) {
				sPos = new kity.BezierPoint( rootX - 30, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 2 ].x, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
			} else {
				sPos = new kity.BezierPoint( rootX + 30, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 3 ].x, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
			}
			var sPosV = sPos.getVertex();
			var endPosV = endPos.getVertex();
			sPos.setVertex( rootX, rootY );
			connect.bezier.setPoints( [ sPos, endPos ] ).stroke( "white" );
			connect.circle.setCenter( endPosV.x + ( Layout.appendside === "left" ? 3 : -3 ), endPosV.y ).fill( "white" ).stroke( "gray" ).setRadius( 2 );
		} else if ( nodeType === "sub" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Path();
				minder.getRenderContainer().addShape( connect );
			}
			connect = Layout.connect;
			var parentShape = node.getParent().getRenderContainer();
			var parentBox = parentShape.getRenderBox();
			var parentLayout = node.getParent().getData( "layout" );
			var nodeStyle = nodeStyles[ node.getType() ];
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
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY, 0, 1 );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY );
				connect.stroke( nodeStyle.stroke );
			} else {
				sX = parentBox.closurePoints[ 0 ].x + parentStyle.margin[ 1 ];
				nodeX = Shape.getRenderBox().closurePoints[ 1 ].x + 1;
				connect.getDrawer()
					.clear()
					.moveTo( sX, sY )
					.lineTo( sX, nodeY > sY ? ( nodeY - nodeStyle.margin[ 3 ] ) : ( nodeY + nodeStyle.margin[ 3 ] ) );
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY, 0, 1 );
				connect.stroke( nodeStyle.stroke );
			}
		}
		//更新收放icon
		if ( nodeType !== "root" ) {
			if ( !Layout.shicon ) {
				Layout.shicon = new ShIcon( node );
			}
			Layout.shicon.update();
		}
	};
	var _style = {
		highlightNode: function ( node ) {
			var highlight = node.getData( "highlight" );
			var nodeType = node.getType();
			var nodeStyle = nodeStyles[ nodeType ];
			var Layout = node.getData( "layout" );
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
				} else {
					Layout.highlightshape.setOpacity( 0 );
				}
				break;
			default:
				break;
			}
		},
		updateLayout: function ( node ) {
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: node
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
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
		},
		initStyle: function () {
			var _root = minder.getRoot();
			minder.handelNodeInsert( _root );
			//设置root的align
			_root.getData( "layout" ).align = "center";
			updateBg( _root );
			initLayout( _root );
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: _root
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
				node: _root
			}, false ) );
			updateShapeByCont( _root );
			updateLayoutHorizon( _root );
			updateLayoutVertical( _root );
			translateNode( _root );
		},
		appendChildNode: function ( parent, node, sibling ) {
			minder.handelNodeInsert( node );
			//设置align和appendside属性并在合适的位置插入节点
			var insert = ( parent.getChildren().indexOf( node ) === -1 );
			var Layout = node.getData( "layout" );
			var parentLayout = parent.getData( "layout" );
			if ( sibling ) {
				var siblingLayout = sibling.getData( "layout" );
				Layout.appendside = siblingLayout.appendside;
				Layout.align = siblingLayout.align;
				parent.insertChild( node, sibling.getIndex() + 1 );
				if ( parent.getType() === "root" ) {
					var sideList = parentLayout[ Layout.appendside + "List" ];
					var idx = sideList.indexOf( sibling );
					sideList.splice( idx + 1, 0, node );
				}
			} else {
				if ( parent.getType() !== "root" ) {
					var prtLayout = parent.getData( "layout" );
					Layout.appendside = prtLayout.appendside;
					Layout.align = prtLayout.align;
				} else {
					if ( parentLayout.rightList.length > 1 && parentLayout.rightList.length > parentLayout.leftList.length ) {
						Layout.appendside = "left";
						Layout.align = "right";
					} else {
						Layout.appendside = "right";
						Layout.align = "left";
					}
				}
				if ( insert ) {
					if ( parent.getType() === "root" ) {
						var sideList1 = parentLayout[ Layout.appendside + "List" ];
						var idx1 = sideList1.length;
						parent.insertChild( node, idx1 );
						sideList1.push( node );
					} else {
						parent.insertChild( node );
					}
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
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: node
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
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
		},
		appendSiblingNode: function ( sibling, node ) {
			var parent = sibling.getParent();
			this.appendChildNode( parent, node, sibling );
		},
		removeNode: function ( nodes ) {
			for ( var i = 0; i < nodes.length; i++ ) {
				minder.handelNodeRemove( nodes[ i ] );
				var nodeLayout = nodes[ i ].getData( "layout" );
				nodeLayout.connect.remove();
				nodeLayout.shicon.remove();
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					parent.removeChild( nodes[ i ] );
					if ( parent.getType() === "root" ) {
						var sideList = parent.getData( "layout" )[ nodeLayout.appendside + "List" ];
						var idx = sideList.indexOf( nodes[ i ] );
						sideList.splice( idx, 1 );
					}
					var set = updateLayoutVertical( nodes[ i ], parent, "remove" );
					for ( var j = 0; j < set.length; j++ ) {
						translateNode( set[ j ] );
						updateConnectAndshIcon( set[ j ] );
					}
				}
			}
		},
		expandNode: function ( node ) {

		}
	};
	this.addLayoutStyle( "default", _style );
	return {
		// "events": {
		// 	"click": function ( e ) {
		// 		var ico = e.kityEvent.targetShape.container;
		// 		if ( ico.class === "shicon" ) {
		// 			var isShow = ico.icon.switchState();
		// 			var node = ico.icon._node;
		// 			var _buffer;
		// 			if ( isShow ) {
		// 				_buffer = node.getChildren();
		// 				while ( _buffer.length !== 0 ) {
		// 					minder.appendChildNode( _buffer[ 0 ].getParent(), _buffer[ 0 ] );
		// 					_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
		// 					_buffer.shift();
		// 				}
		// 			} else {
		// 				var Layout = node.getData( "layout" );
		// 				var marginTop = Layout.margin[ 0 ];
		// 				var marginBottom = Layout.margin[ 2 ];
		// 				Layout.branchheight = node.getRenderContainer().getHeight() + marginTop + marginBottom;
		// 				_buffer = node.getChildren();
		// 				while ( _buffer.length !== 0 ) {
		// 					try {
		// 						_buffer[ 0 ].getData( "layout" ).shape.clear();
		// 						_buffer[ 0 ].getRenderContainer().remove();
		// 					} catch ( error ) {}
		// 					_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
		// 					_buffer.shift();
		// 				}
		// 				var set = updateLayoutVertical( node, node.getParent(), "append" );
		// 				for ( var i = 0; i < set.length; i++ ) {
		// 					translateNode( set[ i ] );
		// 				}
		// 			}
		// 		}
		// 	}
		// }
	};
} );