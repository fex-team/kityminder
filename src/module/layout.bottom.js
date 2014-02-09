KityMinder.registerModule( "LayoutBottom", function () {
	var minder = this;
	var ShIcon = kity.createClass( "DefaultshIcon", ( function () {
		return {
			constructor: function ( node ) {
				this._show = false;
				this._node = node;
				var iconShape = this.shape = new kity.Group();
				iconShape.class = "shicon";
				iconShape.icon = this;
				var rect = this._rect = new kity.Rect().fill( "white" ).stroke( "gray" ).setWidth( 10 ).setHeight( 10 ).setRadius( 2 );
				var plus = this._plus = new kity.Path();
				plus.getDrawer()
					.moveTo( 2, 5 )
					.lineTo( 8, 5 )
					.moveTo( 5, 2 )
					.lineTo( 5, 8 );
				plus.stroke( "gray" );
				var dec = this._dec = new kity.Path();
				dec.getDrawer()
					.moveTo( 2, 5 )
					.lineTo( 8, 5 );
				dec.stroke( "gray" );
				minder.getRenderContainer().addShape( iconShape );
				iconShape.addShapes( [ rect, plus, dec ] );
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
				var nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x + 5;
				var nodeY = nodeShape.getRenderBox().closurePoints[ 1 ].y + 1;
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
				var bgRc = node.getBgRc();
				var contRc = node.getContRc();
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();
				var shicon = this._shicon = new ShIcon( node );
				bgRc.addShape( rect );
				var connect = this._connect = new kity.Group();
				var path = connect.path = new kity.Path();
				var circle = connect.circle = new kity.Circle();
				connect.addShapes( [ path, circle ] );
				minder.getRenderContainer().addShape( connect );
				var Layout = {
					radius: 0,
					fill: "white",
					color: "black",
					padding: [ 5.5, 20, 5.5, 20 ],
					fontSize: 20,
					margin: [ 10, 10, 30, 50 ],
					shape: this,
					align: ( "leftright" ).replace( node.getData( "layout" ).appendside, "" ),
					appendside: node.getData( "layout" ).appendside
				};
				node.setData( "layout", Layout );
				contRc.setTransform( new kity.Matrix().translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 15 ) );
				this.update();
			},
			update: function () {
				var rect = this._rect;
				var node = this._node;
				var contRc = node.getContRc();
				var txt = node.getTextShape();
				var Layout = node.getData( "layout" );
				txt.setContent( node.getData( "text" ) ).fill( Layout.color );
				var _contWidth = contRc.getWidth();
				var _contHeight = contRc.getHeight();
				var _rectWidth = _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ];
				var _rectHeight = _contHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ];
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( node.getData( "highlight" ) ? "chocolate" : Layout.fill ).setRadius( Layout.radius );
				this.updateConnect();
				this.updateShIcon();
			},
			updateConnect: function () {
				var node = this._node;
				var Layout = node.getData( "layout" );
				if ( Layout.x && Layout.y ) {
					var connect = this._connect;
					connect.circle.setCenter( Layout.x + 10, Layout.y - 3 ).fill( "white" ).stroke( "gray" ).setRadius( 2 );
					var parent = node.getParent();
					var parentLayout = parent.getData( "layout" );
					var sX = parentLayout.x + 10.5,
						pY = parentLayout.y + parent.getRenderContainer().getHeight() + 0.5,
						sY = parentLayout.y + parent.getRenderContainer().getHeight() + parentLayout.margin[ 2 ] + 0.5;
					connect.path.getDrawer()
						.clear()
						.moveTo( sX, pY )
						.lineTo( sX, sY )
						.lineTo( Layout.x + 10.5, sY )
						.lineTo( Layout.x + 10.5, Layout.y );
					connect.path.stroke( "white" );
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
	//子分支
	var SubBranch = kity.createClass( "DefaultSubBranch", ( function () {
		return {
			constructor: function ( node ) {
				this._node = node;
				var bgRc = node.getBgRc();
				var contRc = node.getContRc();
				var underline = this._underline = new kity.Path();
				var shicon = this._shicon = new ShIcon( node );
				var highlightshape = this._highlightshape = new kity.Rect();
				bgRc.addShapes( [ highlightshape, underline ] );
				var connect = this._connect = new kity.Path();
				minder.getRenderContainer().addShape( connect );
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
				contRc.setTransform( new kity.Matrix().translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 10 ) );
				highlightshape.fill( "chocolate" ).translate( -1, 0 );
				this.update();
			},
			update: function () {
				var node = this._node;
				var contRc = node.getContRc();
				var Layout = node.getData( "layout" );
				var underline = this._underline;
				var highlightshape = this._highlightshape;
				var txt = node.getTextShape();
				txt.setContent( node.getData( "text" ) ).fill( Layout.color ).setSize( Layout.fontSize );
				var _contWidth = contRc.getWidth();
				var _contHeight = contRc.getHeight();
				var sY = Layout.padding[ 0 ] + _contHeight / 2;
				underline.getDrawer()
					.clear()
					.moveTo( 0, _contHeight + Layout.padding[ 2 ] + Layout.padding[ 0 ] )
					.lineTo( _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ], _contHeight + Layout.padding[ 2 ] + Layout.padding[ 0 ] );
				underline.stroke( Layout.stroke );
				highlightshape
					.setWidth( _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ] )
					.setHeight( _contHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ] )
					.setOpacity( node.getData( "highlight" ) ? 1 : 0 );
				this.updateConnect();
				this.updateShIcon();
			},
			updateConnect: function () {
				var node = this._node;
				var Layout = node.getData( "layout" );
				if ( Layout.x && Layout.y ) {
					var connect = this._connect;
					var parent = node.getParent();
					var parentLayout = parent.getData( "layout" );
					var sX = parentLayout.x + 10.5,
						pY = parentLayout.y + parent.getRenderContainer().getHeight() + 10.5,
						sY = Layout.y + 0.5;
					connect.getDrawer()
						.clear()
						.moveTo( sX, pY )
						.lineTo( sX, sY )
						.lineTo( Layout.x + 0.5, sY )
						.lineTo( Layout.x + 0.5, Layout.y + node.getRenderContainer().getHeight() );
					connect.stroke( "white" );
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
				var bgRc = node.getBgRc();
				var contRc = node.getContRc();
				var rect = this._rect = new kity.Rect();
				bgRc.addShape( rect );
				this._node = node;
				var Layout = {
					shape: this,
					x: 100,
					y: 50,
					align: "center",
					appendside: node.getData( "layout" ).appendside || "right",
					leftList: [],
					rightList: [],
					color: "white",
					fontSize: 20,
					fill: "#00a6d8",
					stroke: null,
					padding: [ 10.5, 10, 10.5, 10 ],
					margin: [ 0, 0, 20, 0 ]
				};
				node.setData( "layout", Layout );
				node.setData( "text", "Minder Root" );
				contRc.setTransform( new kity.Matrix().translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 15 ) );
				this.update();
			},
			update: function () {
				var rect = this._rect;
				var connect = this._connect;
				var node = this._node;
				var txt = node.getTextShape();
				var contRc = node.getContRc();
				var Layout = node.getData( "layout" );
				txt.setContent( node.getData( "text" ) ).fill( Layout.color );
				var _contWidth = contRc.getWidth();
				var _contHeight = contRc.getHeight();
				var _rectWidth = _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ];
				var _rectHeight = _contHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ];
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( node.getData( "highlight" ) ? "chocolate" : Layout.fill );
			},
			clear: function () {
				this._node.getRenderContainer().clear();
			}
		};
	} )() );
	var drawNode = function ( node ) {
		var shape = node.getData( "layout" ).shape;
		shape.update();
	};
	//以某个节点为seed对整体高度进行更改计算
	var updateLayoutVertical = function ( node ) {
		var effectSet = [ node ];
		var Layout = node.getData( "layout" );
		var parent = node.getParent();
		var parentLayout = parent.getData( "layout" );
		var parentShape = parent.getRenderContainer();
		Layout.y = parentLayout.y + parentShape.getHeight() + parentLayout.margin[ 2 ] + Layout.margin[ 0 ];
		return effectSet;
	};

	//以某个节点为seed对水平方向进行调整(包括调整子树)
	var updateLayoutHorizon = function ( node ) {
		var effectSet = []; //返回受影响（即需要进行下一步translate的节点）
		var nodeLayout = node.getData( "layout" );
		var _buffer = [ minder.getRoot() ];
		var countBranchWidth = function ( node ) {
			var Layout = node.getData( "layout" );
			var marginLeft = Layout.margin[ 3 ],
				marginRight = Layout.margin[ 1 ];
			var nodewidth = node.getRenderContainer().getWidth() + marginLeft + marginRight;
			var nodeChildWidth = ( function () {
				var sum = 0;
				var children = node.getChildren();
				for ( var i = 0; i < children.length; i++ ) {
					sum += children[ i ].getData( "layout" ).branchwidth;
				}
				return sum;
			} )();
			Layout.branchwidth = ( nodewidth > nodeChildWidth ? nodewidth : nodeChildWidth );
		};
		var parent = node;
		while ( parent ) {
			countBranchWidth( parent );
			parent = parent.getParent();
		}
		while ( _buffer.length !== 0 ) {
			_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
			var bufferLayout = _buffer[ 0 ].getData( "layout" );
			var sX = bufferLayout.x;
			var children = _buffer[ 0 ].getChildren();
			for ( var i = 0; i < children.length; i++ ) {
				countBranchWidth( children[ i ] );
				var childrenLayout = children[ i ].getData( "layout" );
				childrenLayout.x = sX;
				sX += childrenLayout.branchwidth;
			}
			effectSet.push( _buffer[ 0 ] );
			_buffer.shift();
		}
		return effectSet;
	};
	var translateNode = function ( node ) {
		var Layout = node.getData( "layout" );
		var nodeShape = node.getRenderContainer();
		nodeShape.setTransform( new kity.Matrix().translate( Layout.x, Layout.y ) );
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
			var _root = this.getRoot();
			minder.handelNodeInsert( _root );
			var rc = new RootShape( _root );
			translateNode( _root );
		},
		updateLayout: function ( node ) {
			drawNode( node );
			var set = updateLayoutHorizon( node );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
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
				childbranch = new MainBranch( node );
			} else {
				node.setType( "sub" );
				childbranch = new SubBranch( node );
			}
			var set1 = updateLayoutVertical( node );
			var set2 = updateLayoutHorizon( node );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				var box = set[ i ].getRenderContainer().getRenderBox();
				set[ i ].setPoint( box.x, box.y );
			}
		},
		appendSiblingNode: function ( sibling, node ) {

		},
		removeNode: function ( nodes ) {

		}
	};
	this.addLayoutStyle( "bottom", _style );
	return {};
} );