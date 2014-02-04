KityMinder.registerModule( "LayoutDefault", function () {
	var _target = this.getRenderTarget();
	var minderWidth = _target.clientWidth;
	var minderHeight = _target.clientHeight;
	var minder = this;
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
	//主分支
	var MainBranch = kity.createClass( "DefaultMainBranch", ( function () {
		return {
			constructor: function ( node ) {
				this._node = node;
				var container = node.getRenderContainer();
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();
				var shicon = this._shicon = new ShIcon( node );
				container.addShapes( [ rect, txt ] );
				var connect = this._connect = new kity.Group();
				var bezier = connect.bezier = new kity.Bezier();
				var circle = connect.circle = new kity.Circle();
				connect.addShapes( [ bezier, circle ] );
				minder.getRenderContainer().addShape( connect ).bringTop( minder.getRoot().getRenderContainer() );
				var Layout = {
					radius: 0,
					fill: "white",
					color: "black",
					padding: [ 5.5, 20, 5.5, 20 ],
					fontSize: 20,
					margin: [ 0, 10, 30, 50 ],
					shape: this,
					align: ( "leftright" ).replace( node.getData( "layout" ).appendside, "" ),
					appendside: node.getData( "layout" ).appendside
				};
				node.setData( "layout", Layout );
				txt.translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 15 );
				this.update();
			},
			update: function () {
				var txt = this._txt;
				var rect = this._rect;
				var node = this._node;
				var Layout = node.getData( "layout" );
				txt.setContent( node.getData( "text" ) ).fill( Layout.color );
				var _txtWidth = txt.getWidth();
				var _txtHeight = txt.getHeight();
				var _rectWidth = _txtWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ];
				var _rectHeight = _txtHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ];
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( node.getData( "highlight" ) ? "chocolate" : Layout.fill ).setRadius( Layout.radius );
				this.updateConnect();
				this.updateShIcon();
			},
			updateConnect: function () {
				var rootX = minder.getRoot().getData( "layout" ).x;
				var rootY = minder.getRoot().getData( "layout" ).y;
				var connect = this._connect;
				var node = this._node;
				var Layout = node.getData( "layout" );
				var parent = node.getParent();
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
			},
			updateShIcon: function () {
				this._shicon.update();
			},
			clear: function () {
				this._node.getRenderContainer().clear();
				this._connect.remove();
				this._shicon.remove();
			}
		};
	} )() );
	//子分支
	var SubBranch = kity.createClass( "DefaultSubBranch", ( function () {
		return {
			constructor: function ( node ) {
				this._node = node;
				var container = node.getRenderContainer();
				var txt = this._txt = new kity.Text();
				var underline = this._underline = new kity.Path();
				var shicon = this._shicon = new ShIcon( node );
				var highlightshape = this._highlightshape = new kity.Rect();
				container.addShapes( [ highlightshape, underline, txt ] );
				var connect = this._connect = new kity.Path();
				minder.getRenderContainer().addShape( connect ).bringTop( minder.getRoot().getRenderContainer() );
				var Layout = {
					stroke: new kity.Pen( "white", 1 ).setLineCap( "round" ).setLineJoin( "round" ),
					color: "white",
					padding: [ 5, 10, 5.5, 10 ],
					fontSize: 12,
					margin: [ 0, 10, 20, 5 ],
					shape: this,
					align: ( "leftright" ).replace( node.getData( "layout" ).appendside, "" ),
					appendside: node.getData( "layout" ).appendside
				};
				node.setData( "layout", Layout );
				txt.translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 10 );
				highlightshape.fill( "chocolate" ).translate( -1, 0 );
				this.update();
			},
			update: function () {
				var node = this._node;
				var Layout = node.getData( "layout" );
				var underline = this._underline;
				var highlightshape = this._highlightshape;
				var txt = this._txt;
				txt.setContent( node.getData( "text" ) ).fill( Layout.color ).setSize( Layout.fontSize );
				var _txtWidth = txt.getWidth();
				var _txtHeight = txt.getHeight();
				var sY = Layout.padding[ 0 ] + _txtHeight / 2;
				underline.getDrawer()
					.clear()
					.moveTo( 0, _txtHeight + Layout.padding[ 2 ] + Layout.padding[ 0 ] )
					.lineTo( _txtWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ], _txtHeight + Layout.padding[ 2 ] + Layout.padding[ 0 ] );
				underline.stroke( Layout.stroke );
				highlightshape
					.setWidth( _txtWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ] )
					.setHeight( _txtHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ] )
					.setOpacity( node.getData( "highlight" ) ? 1 : 0 );
				this.updateConnect();
				this.updateShIcon();
			},
			updateConnect: function () {
				var connect = this._connect;
				var node = this._node;
				var parentShape = node.getParent().getRenderContainer();
				var parentBox = parentShape.getRenderBox();
				var parentLayout = node.getParent().getData( "layout" );
				var Layout = node.getData( "layout" );
				var Shape = node.getRenderContainer();
				var sX, sY = parentLayout.y;
				var nodeX, nodeY = Shape.getRenderBox().closurePoints[ 1 ].y;
				if ( Layout.appendside === "left" ) {
					sX = parentBox.closurePoints[ 1 ].x - parentLayout.margin[ 1 ];
					nodeX = Shape.getRenderBox().closurePoints[ 0 ].x;
					connect.getDrawer()
						.clear()
						.moveTo( sX, sY )
						.lineTo( sX, nodeY > sY ? ( nodeY - Layout.margin[ 3 ] ) : ( nodeY + Layout.margin[ 3 ] ) );
					if ( nodeY > sY ) connect.getDrawer().carcTo( Layout.margin[ 3 ], nodeX, nodeY, 0, 1 );
					else connect.getDrawer().carcTo( Layout.margin[ 3 ], nodeX, nodeY );
					connect.stroke( Layout.stroke );
				} else {
					sX = parentBox.closurePoints[ 0 ].x + parentLayout.margin[ 1 ];
					nodeX = Shape.getRenderBox().closurePoints[ 1 ].x + 1;
					connect.getDrawer()
						.clear()
						.moveTo( sX, sY )
						.lineTo( sX, nodeY > sY ? ( nodeY - Layout.margin[ 3 ] ) : ( nodeY + Layout.margin[ 3 ] ) );
					if ( nodeY > sY ) connect.getDrawer().carcTo( Layout.margin[ 3 ], nodeX, nodeY );
					else connect.getDrawer().carcTo( Layout.margin[ 3 ], nodeX, nodeY, 0, 1 );
					connect.stroke( Layout.stroke );
				}
			},
			updateShIcon: function () {
				this._shicon.update();
			},
			clear: function () {
				this._node.getRenderContainer().clear();
				this._connect.remove();
				this._shicon.remove();
			}
		};
	} )() );
	//根节点
	var RootShape = kity.createClass( "DefaultRootShape", ( function () {
		return {
			constructor: function ( node ) {
				var container = node.getRenderContainer();
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();
				container.addShapes( [ rect, txt ] );
				this._node = node;
				var Layout = {
					shape: this,
					x: minderWidth / 2,
					y: minderHeight / 2,
					align: "center",
					appendside: node.getData( "layout" ).appendside || "right",
					leftList: [],
					rightList: [],
					color: "white",
					fontSize: 20,
					fill: "cadetblue",
					stroke: null,
					padding: [ 10.5, 10, 10.5, 10 ],
					radius: 15,
					margin: [ 0, 0, 0, 0 ]
				};
				node.setData( "layout", Layout );
				node.setData( "text", "Minder Root" );
				txt.translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 15 );
				this.update();
			},
			update: function () {
				var txt = this._txt;
				var rect = this._rect;
				var connect = this._connect;
				var node = this._node;
				var Layout = node.getData( "layout" );
				txt.setContent( node.getData( "text" ) ).fill( Layout.color );
				var _txtWidth = txt.getWidth();
				var _txtHeight = txt.getHeight();
				var _rectWidth = _txtWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ];
				var _rectHeight = _txtHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ];
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( node.getData( "highlight" ) ? "chocolate" : Layout.fill ).setRadius( Layout.radius );
			},
			clear: function () {
				this._node.getRenderContainer().clear();
			}
		};
	} )() );
	//流程：绘制->计算Y坐标->计算X坐标->translate
	//绘制node
	var drawNode = function ( node ) {
		var shape = node.getData( "layout" ).shape;
		shape.update();
	};

	//以某个节点为seed对整体高度进行更改计算
	var updateLayoutVertical = function ( node, parent, action ) {
		var effectSet = [ node ]; //用于返回受影响的节点集
		if ( !parent ) {
			return effectSet;
		}
		var Layout = node.getData( "layout" );
		var marginTop = Layout.margin[ 0 ],
			marginBottom = Layout.margin[ 2 ];
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
		var prt = parent;
		do {
			var minH = prt.getRenderContainer().getHeight() + marginTop + marginBottom;
			var childH = getChildHeight( prt, appendside );
			var branchH = ( minH > childH ? minH : childH );
			var prtLayout = prt.getData( "layout" );

			if ( prt.getParent() ) {
				prtLayout.branchheight = branchH + prtLayout.margin[ 0 ] + prtLayout.margin[ 2 ];
			} else {
				prtLayout[ appendside + "Height" ] = branchH + prtLayout.margin[ 0 ] + prtLayout.margin[ 2 ];
			}
			prt = prt.getParent();
		} while ( prt );
		//遍历
		var _buffer = [ minder.getRoot() ];
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
		if ( parent ) {
			var parentLayout = parent.getData( "layout" );
			var parentWidth = parent.getRenderContainer().getWidth();
			if ( parentLayout.align === "center" ) parentWidth = parentWidth / 2;

			var parentX = parentLayout.x;
			switch ( appendside ) {
			case "left":
				nodeLayout.x = parentX - parentWidth - parentLayout.margin[ 1 ] - nodeLayout.margin[ 3 ];
				break;
			case "right":
				nodeLayout.x = parentX + parentWidth + parentLayout.margin[ 1 ] + nodeLayout.margin[ 3 ];
				break;
			default:
				break;
			}
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
		if ( Layout.shape ) {
			if ( Layout.shape.updateConnect ) Layout.shape.updateConnect();
			if ( Layout.shape.updateShIcon ) Layout.shape.updateShIcon();
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
	var _style = {
		renderNode: function ( node ) {
			drawNode( node );
		},
		initStyle: function () {
			minder.getRenderContainer().clear();
			//绘制root并且调整到正确位置
			var _root = this.getRoot();
			minder.handelNodeInsert( _root );
			var rc = new RootShape( _root );
			translateNode( _root );
			var box = _root.getRenderContainer().getRenderBox();
			_root.setPoint( box.x, box.y );
			var _buffer = _root.getChildren();
			var Layout = _root.getData( "layout" );
			//根据保存的xy值初始化左右子树
			if ( _buffer.length !== 0 ) {
				for ( var i = 0; i < _buffer.length; i++ ) {
					var point = _buffer[ i ].getPoint();
					if ( point && point.x && point.y ) {
						if ( point.x > Layout.x ) {
							Layout.rightList.push( _buffer[ i ] );
						} else {
							Layout.leftList.push( _buffer[ i ] );
						}
					} else {
						break;
					}
				}
			}
			//如果是从其他style切过来的，需要重新布局
			while ( _buffer.length !== 0 ) {
				_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
				var prt = _buffer[ 0 ].getParent();
				_buffer[ 0 ].clearLayout();
				_buffer[ 0 ].children = [];
				this.appendChildNode( prt, _buffer[ 0 ] );
				_buffer.shift();
			}
		},
		appendChildNode: function ( parent, node, index ) {
			minder.handelNodeInsert( node );
			var _root = this.getRoot();
			var childbranch;
			if ( !node.getData( "layout" ) ) node.setData( "layout", {} );
			if ( parent.getChildren().indexOf( node ) === -1 ) {
				if ( !index ) parent.appendChild( node );
				else parent.insertChild( node, index );
			}
			var parentLayout = parent.getData( "layout" );
			var Layout = node.getData( "layout" );
			if ( parent.getType() === "root" ) {
				node.setType( "main" );
				var leftList = parentLayout.leftList;
				var rightList = parentLayout.rightList;
				var sibling = parent.getChildren();
				var aside = Layout.appendside;
				if ( !aside ) {
					if ( rightList.length > 1 && rightList.length > leftList.length ) {
						aside = "left";
					} else {
						aside = "right";
					}
					Layout.appendside = aside;
				}
				if ( leftList.indexOf( node ) !== -1 ) {
					Layout.appendside = "left";
				} else if ( rightList.indexOf( node ) !== -1 ) {
					Layout.appendside = "right";
				} else {
					parentLayout.appendside = aside;
					parentLayout[ aside + "List" ].push( node );
				}
				childbranch = new MainBranch( node );
			} else {
				node.setType( "sub" );
				Layout.appendside = parentLayout.appendside;
				childbranch = new SubBranch( node );
			}
			var set1 = updateLayoutVertical( node, parent, "append" );
			var set2 = updateLayoutHorizon( node );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				var box = set[ i ].getRenderContainer().getRenderBox();
				set[ i ].setPoint( box.x, box.y );
			}
			//var shicon = new ShIcon( node );
		},
		appendSiblingNode: function ( sibling, node ) {
			var siblingLayout = sibling.getData( "layout" );
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
			for ( var i = 0; i < nodes.length; i++ ) {
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					var _buffer = [ nodes[ i ] ];
					var parentLayout = parent.getData( "layout" );
					while ( _buffer.length !== 0 ) {
						_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
						_buffer[ 0 ].getData( "layout" ).shape.clear();
						_buffer[ 0 ].getRenderContainer().remove();
						var prt = _buffer[ 0 ].getParent();
						prt.removeChild( _buffer[ 0 ] );
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
			}
		}
	};
	this.addLayoutStyle( "default", _style );
	return {
		"events": {
			"click": function ( e ) {
				var ico = e.kityEvent.targetShape.container;
				if ( ico.class === "shicon" ) {
					var isShow = ico.icon.switchState();
					var node = ico.icon._node;
					var _buffer;
					if ( isShow ) {
						_buffer = node.getChildren();
						while ( _buffer.length !== 0 ) {
							minder.appendChildNode( _buffer[ 0 ].getParent(), _buffer[ 0 ] );
							_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
							_buffer.shift();
						}
					} else {
						var Layout = node.getData( "layout" );
						var marginTop = Layout.margin[ 0 ];
						var marginBottom = Layout.margin[ 2 ];
						Layout.branchheight = node.getRenderContainer().getHeight() + marginTop + marginBottom;
						_buffer = node.getChildren();
						while ( _buffer.length !== 0 ) {
							try {
								_buffer[ 0 ].getData( "layout" ).shape.clear();
							} catch ( error ) {}
							_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
							_buffer.shift();
						}
						var set = updateLayoutVertical( node, node.getParent(), "append" );
						for ( var i = 0; i < set.length; i++ ) {
							translateNode( set[ i ] );
						}
					}
				}
			}
		}
	};
} );