KityMinder.registerModule( "LayoutDefault", function () {
	var _target = this.getRenderTarget();
	var minderWidth = _target.clientWidth;
	var minderHeight = _target.clientHeight;
	var minder = this;
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
		var _buffer = node.getChildren();
		while ( _buffer.length !== 0 ) {
			countX( _buffer[ 0 ] );
			effectSet.push( _buffer[ 0 ] );
			_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
			_buffer.shift();
		}
		return effectSet;
	};

	//调整node的位置
	var translateNode = function ( node ) {
		var nodeShape = node.getRenderContainer();
		var Layout = node.getData( "layout" );
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
		return true;
	};

	//主分支
	var MainBranch = kity.createClass( "DefaultMainBranch", ( function () {
		return {
			constructor: function ( node ) {
				var container = node.getRenderContainer();
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();

				var connect = this._connect = new kity.Bezier();
				var Layout = {
					radius: 10,
					fill: "skyblue",
					stroke: "white",
					strokeWidth: 1,
					color: "black",
					padding: [ 5, 10, 5, 10 ],
					fontSize: 20,
					margin: [ 0, 10, 10, 50 ]
				};
				node.setData( "layout", Layout );
			},
			update: function ( node ) {

			}
		};
	} )() );
	//子分支
	var SubBranch = kity.createClass( "DefaultSubBranch", ( function () {
		return {
			constructor: function ( node ) {
				var container = node.getRenderContainer();
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();
				var connect = this._connect = new kity.Bezier();
				var Layout = {
					radius: 10,
					fill: "skyblue",
					stroke: "orange",
					strokeWidth: 1,
					color: "black",
					padding: [ 5, 10, 5, 10 ],
					fontSize: 20,
					margin: [ 0, 10, 10, 50 ]
				};
				node.setData( "layout", Layout );
			},
			update: function ( node ) {

			},
			clear: function () {

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
					appendside: "right",
					leftList: [],
					rightList: [],
					color: "white",
					fontSize: 20,
					background: "burlywood",
					stroke: "white",
					padding: [ 10.5, 20, 10.5, 20 ],
					radius: 15
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
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( Layout.background ).stroke( node.getData( "highlight" ) ? Layout.stroke : new kity.Pen( "white", 3 ) ).setRadius( Layout.radius );
			},
			clear: function () {
				this._node.getRenderContainer().clear();
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
	var _style = {
		renderNode: function ( node ) {
			drawNode( node );
		},
		initStyle: function () {
			//绘制root并且调整到正确位置
			var _root = this.getRoot();
			minder.handelNodeInsert( _root );
			var rc = new RootShape( _root );
			translateNode( _root );
			var box = _root.getRenderContainer().getRenderBox();
			_root.setPoint( box.x, box.y );
			var _buffer = _root.getChildren();
			var Layout = _root.getData( "layout" );
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
			var _root = this.getRoot();
			var childbranch;
			if ( parent.getType() === "root" ) {
				childbranch = new MainBranch( node );
			} else {
				childbranch = new SubBranch( node );
			}

			// if ( !node.getData( "layout" ) ) node.setData( "layout", {} );
			// var Layout = node.getData( "layout" );
			// var parentLayout = parent.getData( "layout" );
			// var minder = this;
			// if ( parent.getChildren().indexOf( node ) === -1 ) {
			// 	if ( !index ) parent.appendChild( node );
			// 	else parent.insertChild( node, index );
			// }
			// minder.handelNodeInsert( node );
			// if ( parent === _root ) {
			// 	node.setType( "main" );
			// 	var leftList = parentLayout.leftList;
			// 	var rightList = parentLayout.rightList;
			// 	var sibling = parent.getChildren();
			// 	var aside = Layout.appendside;
			// 	if ( !aside ) {
			// 		if ( rightList.length > 1 && rightList.length > leftList.length ) {
			// 			aside = "left";
			// 		} else {
			// 			aside = "right";
			// 		}
			// 		Layout.appendside = aside;
			// 	}
			// 	if ( leftList.indexOf( node ) !== -1 ) {
			// 		Layout.appendside = "left";
			// 	} else if ( rightList.indexOf( node ) !== -1 ) {
			// 		Layout.appendside = "right";
			// 	} else {
			// 		parentLayout.appendside = aside;
			// 		parentLayout[ aside + "List" ].push( node );
			// 	}
			// } else {
			// 	node.setType( "sub" );
			// }

			// var appendside = Layout.appendside || parentLayout.appendside;
			// Layout.appendside = appendside;
			// if ( appendside === "left" ) {
			// 	Layout.align = "right";
			// } else {
			// 	Layout.align = "left";
			// }

			// drawNode( node );
			// var set1 = updateLayoutVertical( node, parent, "append" );
			// var set2 = updateLayoutHorizon( node );
			// var set = uSet( set1, set2 );
			// for ( var i = 0; i < set.length; i++ ) {
			// 	translateNode( set[ i ] );
			// 	var box = set[ i ].getRenderContainer().getRenderBox();
			// 	set[ i ].setPoint( box.x, box.y );
			// }
		},
		updateLayout: function ( node ) {
			drawNode( node );
			var set = updateLayoutHorizon( node );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
			}
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
			var minder = this;
			for ( var i = 0; i < nodes.length; i++ ) {
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					var _buffer = [ nodes[ i ] ];
					var parentLayout = parent.getData( "layout" );
					while ( _buffer.length !== 0 ) {
						_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
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
	return {};
} );