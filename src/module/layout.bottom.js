KityMinder.registerModule( "LayoutBottom", function () {
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
				var Layout = node.getLayout();
				var nodeShape = node.getRenderContainer();
				var nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x + 10;
				var nodeY = nodeShape.getRenderBox().closurePoints[ 0 ].y;
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
			color: '#430',
			fill: '#e9df98',
			fontSize: 24,
			padding: [ 15.5, 25.5, 15.5, 25.5 ],
			margin: [ 0, 0, 0, 0 ],
			radius: 10,
			highlight: 'rgb(254, 219, 0)'
		},
		"main": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			fill: '#A4c5c0',
			color: "#333",
			padding: [ 6.5, 20, 6.5, 20 ],
			fontSize: 16,
			margin: [ 20, 10, 10, 10 ],
			radius: 5,
			highlight: 'rgb(254, 219, 0)'
		},
		"sub": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			color: "white",
			fontSize: 12,
			margin: [ 10, 10, 20, 6 ],
			padding: [ 5, 10, 5.5, 10 ],
			highlight: 'rgb(254, 219, 0)'
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
		var txtShape = node.getTextShape();
		txtShape.fill( nodeStyle.color ).setSize( nodeStyle.fontSize ).setY( -3 );
		if ( nodeType === "main" ) {
			var subgroup = Layout.subgroup = new kity.Group();
			minder.getRenderContainer().addShape( subgroup );
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
		contRc.setTransform( new kity.Matrix().translate( nodeStyle.padding[ 3 ], nodeStyle.padding[ 0 ] + node.getTextShape().getHeight() ) );
	};
	var updateLayoutAll = function ( node, parent, action ) {
		var effectSet = [];
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var _root = minder.getRoot();
		var countMainWidth = function ( node ) {
			var nLayout = node.getLayout();
			var selfwidth = node.getRenderContainer().getWidth() + nodeStyles.main.margin[ 1 ] + nodeStyles.main.margin[ 3 ];
			var childwidth = Layout.subgroup.getWidth() + nodeStyles.sub.margin[ 3 ];
			var branchwidth = nLayout.branchwidth = ( selfwidth > childwidth ? selfwidth : childwidth );
			return branchwidth;
		};
		if ( nodeType === "root" ) {
			Layout.x = getMinderSize().width / 2;
			Layout.y = 100;
			Layout.align = "center";
			effectSet.push( node );
			var children = node.getChildren();
			for ( var i = 0; i < children.length; i++ ) {
				var childLayout = children[ i ].getLayout();
				childLayout.y = Layout.y + node.getRenderContainer().getHeight() + nodeStyles.main.margin[ 0 ];
			}
			effectSet = effectSet.concat( children );
		} else if ( nodeType === "main" ) {
			Layout.align = "center";
			var mainnodes = _root.getChildren();
			var rootLayout = _root.getLayout();
			var rootbranchwidth = 0;
			for ( var j = 0; j < mainnodes.length; j++ ) {
				rootbranchwidth += countMainWidth( mainnodes[ j ] );
			}
			var sX = rootLayout.x - rootbranchwidth / 2;
			for ( var k = 0; k < mainnodes.length; k++ ) {
				var mLayout = mainnodes[ k ].getLayout();
				var mWidth = mainnodes[ k ].getRenderContainer().getWidth();
				mLayout.x = sX + nodeStyles.main.margin[ 3 ] + mWidth / 2;
				sX += ( nodeStyles.main.margin[ 1 ] + nodeStyles.main.margin[ 3 ] + mWidth );
			}
			if ( action === "append" ) {
				Layout.y = rootLayout.y + _root.getRenderContainer().getHeight() + nodeStyles.main.margin[ 0 ];
			}
			effectSet = mainnodes;
		} else {
			Layout.align = "left";
			var parentLayout = parent.getLayout();
			if ( parent.getType() === "main" ) {
				Layout.x = 10;
				Layout.y = nodeStyles.sub.margin[ 0 ];
			} else {
				Layout.x = parentLayout.x + 10;
				Layout.y = parentLayout.y + parent.getRenderContainer().getHeight() + nodeStyles.sub.margin[ 0 ];
			}
			effectSet = [ node ];
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
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x - _rectWidth, Layout.y ) );
			break;
		case "center":
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x - _rectWidth / 2, Layout.y ) );
			break;
		default:
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x, Layout.y ) );
			break;
		}
		if ( node.getType() === "main" ) {
			Layout.subgroup.setTransform( new kity.Matrix().translate( Layout.x - node.getRenderContainer().getWidth() / 2 + 10, Layout.y + node.getRenderContainer().getHeight() ) );
		}
		node.setPoint( Layout.x, Layout.y );
	};
	var updateConnectAndshIcon = function ( node ) {
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var nodeStyle = nodeStyles[ node.getType() ];
		var connect;
		//更新连线
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
					node.getTextShape().fill( 'black' );
				} else {
					Layout.highlightshape.setOpacity( 0 );
					node.getTextShape().fill( 'white' );
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
			var set = updateLayoutAll( node );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
		},
		initStyle: function () {
			var _root = minder.getRoot();
			minder.handelNodeInsert( _root );
			//设置root的align
			_root.getLayout().align = "center";
			updateBg( _root );
			initLayout( _root );
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: _root
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
				node: _root
			}, false ) );
			updateShapeByCont( _root );
			updateLayoutAll( _root );
			translateNode( _root );
			var _buffer = [ _root ];
			var _cleanbuffer = [];
			//打散结构
			while ( _buffer.length !== 0 ) {
				var children = _buffer[ 0 ].getChildren();
				_buffer = _buffer.concat( children );
				for ( var i = 0; i < children.length; i++ ) {
					children[ i ].getLayout().parent = _buffer[ 0 ];
				}
				_buffer[ 0 ].clearChildren();
				if ( _buffer[ 0 ] !== _root ) _cleanbuffer.push( _buffer[ 0 ] );
				_buffer.shift();
			}
			//重组结构
			for ( var j = 0; j < _cleanbuffer.length; j++ ) {
				this.appendChildNode( _cleanbuffer[ j ].getLayout().parent, _cleanbuffer[ j ] );
			}
		},
		appendChildNode: function ( parent, node, sibling ) {
			node.clearLayout();
			var parentLayout = parent.getLayout();
			//设置分支类型
			if ( parent.getType() === "root" ) {
				node.setType( "main" );
				minder.handelNodeInsert( node );
			} else {
				node.setType( "sub" );
				//将节点加入到main分支的subgroup中
				parentLayout.subgroup.addShape( node.getRenderContainer() );
				node.getLayout().subgroup = parentLayout.subgroup;
			}
			if ( sibling ) {
				parent.insertChild( node, sibling.getIndex() + 1 );
			} else {
				parent.appendChild( node );
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
			var set = updateLayoutAll( node, parent, "append" );
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

		},
		expandNode: function ( ico ) {

		}
	};
	this.addLayoutStyle( "bottom", _style );
	return {};
} );