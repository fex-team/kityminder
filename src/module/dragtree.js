var GM = KityMinder.Geometry;

// 矩形的变形动画定义
var AreaAnimator = kity.createClass( "AreaAnimator", {
	base: kity.Animator,
	constructor: function ( startArea, endArea ) {
		startArea.opacity = 0;
		endArea.opacity = 0.8;
		this.callBase( startArea, endArea, function ( target, value ) {
			target.setPosition( value.x, value.y );
			target.setSize( value.width, value.height );
			target.setOpacity( value.opacity );
		} );
	}
} );

var MoveToParentCommand = kity.createClass( 'MoveToParentCommand', {
	base: Command,
	execute: function ( minder, nodes, parent ) {
		var node;
		if ( ( !parent.isExpanded() ) && ( parent.getChildren().length > 0 ) && ( parent.getType() !== 'root' ) ) {
			minder.expandNode( parent );
		}
		for ( var i = nodes.length - 1; i >= 0; i-- ) {
			node = nodes[ i ];
			if ( node.getParent() ) {
				minder.removeNode( [ node ] );
				minder.appendChildNode( parent, node );
				if ( node.isExpanded() && node.getChildren().length !== 0 ) {
					minder.expandNode( node );
				}
			}
		}
		minder.select( nodes, true );
	}
} );


function boxMapper( node ) {
	return node.getRenderContainer().getRenderBox( 'top' );
}

// 对拖动对象的一个替代盒子，控制整个拖放的逻辑，包括：
//    1. 从节点列表计算出拖动部分
//    2. 产生替代矩形包围拖动部分
//    3. 动画收缩替代矩形到固定大小，成为替代盒子
//    4. 控制替代盒子的移动
//    5. 计算可以 drop 的节点，产生 drop 交互提示
var DragBox = kity.createClass( "DragBox", {
	base: kity.Group,


	constructor: function ( minder ) {
		this.callBase();
		this._minder = minder;
		this._draw();
	},

	// 绘制显示拖放范围的矩形和显示拖放信息的文本
	_draw: function () {
		this._rect = new kity.Rect()
			.setRadius( 5 )
			.fill( 'white' )
			.stroke( '#3399ff', 1 );
		this._text = new kity.Text()
			.setSize( 14 )
			.setTextAnchor( 'middle' )
			.fill( 'black' )
			.setStyle( 'cursor', 'default' );
		this.addShapes( [ this._rect, this._text ] );
	},


	// 从选中的节点计算拖放源
	//    并不是所有选中的节点都作为拖放源，如果选中节点中存在 A 和 B，
	//    并且 A 是 B 的祖先，则 B 不作为拖放源
	//    
	//    计算过程：
	//       1. 将节点按照树高排序，排序后只可能是前面节点是后面节点的祖先
	//       2. 从后往前枚举排序的结果，如果发现枚举目标之前存在其祖先，
	//          则排除枚举目标作为拖放源，否则加入拖放源
	_calcDragSources: function () {
		this._dragSources = this._minder.getSelectedAncestors();
	},


	// 计算拖放目标可以释放的节点列表（释放意味着成为其子树），存在这条限制规则：
	//    - 不能拖放到拖放目标的子树上（允许拖放到自身，因为多选的情况下可以把其它节点加入）
	//    
	//    1. 加入当前节点（初始为根节点）到允许列表
	//    2. 对于当前节点的每一个子节点：
	//       (1) 如果是拖放目标的其中一个节点，忽略（整棵子树被剪枝）
	//       (2) 如果不是拖放目标之一，以当前子节点为当前节点，回到 1 计算
	//    3. 返回允许列表
	// 
	_calcDropTargets: function () {

		function findAvailableParents( nodes, root ) {
			var availables = [],
				i;
			availables.push( root );
			root.getChildren().forEach( function ( test ) {
				for ( i = 0; i < nodes.length; i++ ) {
					if ( nodes[ i ] == test ) return;
				}
				availables = availables.concat( findAvailableParents( nodes, test ) );
			} );
			return availables;
		}

		this._dropTargets = findAvailableParents( this._dragSources, this._minder.getRoot() );
		this._dropTargetBoxes = this._dropTargets.map( boxMapper );
	},

	// 进入拖放模式：
	//    1. 计算拖放源和允许的拖放目标
	//    2. 渲染拖放盒子
	//    3. 启动收缩动画
	//    4. 标记已启动
	_enterDragMode: function () {
		this._calcDragSources();
		if ( !this._dragSources.length ) {
			this._startPosition = null;
			return false;
		}
		this._calcDropTargets();
		this._drawForDragMode();
		this._shrink();
		this._dragMode = true;
		return true;
	},
	_leaveDragMode: function () {
		this.remove();
		this._dragMode = false;
		this._dropSucceedTarget = null;
		this._removeDropHint();
	},
	_drawForDragMode: function () {
		this._text.setContent( this._dragSources.length + ' items' );
		this._text.setPosition( this._startPosition.x, this._startPosition.y + 5 );
		this._minder.getPaper().addShape( this );
	},
	_shrink: function () {
		// 合并所有拖放源图形的矩形即可
		function calcSourceArea( boxArray ) {
			var area = boxArray.pop();
			while ( boxArray.length ) {
				area = GM.mergeBox( area, boxArray.pop() );
			}
			return {
				x: area.left,
				y: area.top,
				width: area.width,
				height: area.height
			};
		}
		// 从焦点发散出一个固定的矩形即可
		function calcFocusArea( focusPoint ) {
			var width = 80,
				height = 30;
			return {
				x: focusPoint.x - width / 2,
				y: focusPoint.y - height / 2,
				width: width,
				height: height
			};
		}

		var sourceArea = calcSourceArea( this._dragSources.map( boxMapper ) );
		var focusArea = calcFocusArea( this._startPosition );
		var animator = new AreaAnimator( sourceArea, focusArea );
		animator.start( this._rect, 400, 'easeOutQuint' );
	},
	// 此处可用线段树优化，但考虑到节点不多，必要性不到，就用暴力测试
	_dropTest: function () {
		var dragBox = this.getRenderBox(),
			test;

		this._dropSucceedTarget = null;
		for ( var i = 0; i < this._dropTargetBoxes.length; i++ ) {
			test = this._dropTargetBoxes[ i ];
			if ( GM.isBoxIntersect( dragBox, test ) ) {
				this._dropSucceedTarget = this._dropTargets[ i ];
				return;
			}
		}
	},
	_updateDropHint: function () {
		var target = this._dropSucceedTarget,
			lastTarget = this._lastSucceedTarget;
		if ( target && target == lastTarget ) return;
		if ( lastTarget ) {
			this._removeDropStyle( lastTarget );
		}
		if ( target ) {
			this._addDropStyle( target );
		}
		this._lastSucceedTarget = target;
	},

	_removeDropHint: function () {
		var lastTarget = this._lastSucceedTarget;
		if ( lastTarget ) {
			this._removeDropStyle( lastTarget );
		}
	},

	_removeDropStyle: function ( node ) {
		node._layout.bgRect.stroke( 'none' );
		this._rect.stroke( '#3399ff', 1 );
	},

	_addDropStyle: function ( node ) {
		node._layout.bgRect.stroke( 'rgb(254, 219, 0)', 3 );
		node.getRenderContainer().fxScale( 1.25, 1.25, 150, 'ease' ).fxScale( 0.8, 0.8, 150, 'ease' );
	},

	dragStart: function ( position ) {
		// 只记录开始位置，不马上开启拖放模式
		// 这个位置同时是拖放范围收缩时的焦点位置（中心）
		this._startPosition = position;
	},

	dragMove: function ( position ) {
		// 启动拖放模式需要最小的移动距离
		var DRAG_MOVE_THRESHOLD = 10;

		if ( !this._startPosition ) return;

		this._dragPosition = position;

		if ( !this._dragMode ) {
			// 判断拖放模式是否该启动
			if ( GM.getDistance( this._dragPosition, this._startPosition ) < DRAG_MOVE_THRESHOLD ) {
				return;
			}
			if ( !this._enterDragMode() ) {
				return;
			}
		}

		var movement = kity.Vector.fromPoints( this._startPosition, this._dragPosition );

		this.setTranslate( movement );

		this._dropTest();
		this._updateDropHint();
	},

	dragEnd: function () {
		this._startPosition = null;
		if ( !this._dragMode ) {
			return;
		}
		if ( this._dropSucceedTarget ) {
			this._minder.execCommand( 'movetoparent', this._dragSources, this._dropSucceedTarget );
		}
		this._leaveDragMode();
	}

} );

KityMinder.registerModule( "DragTree", function () {
	var dragStartPosition, dragBox, dragTargets, dropTargets, dragTargetBoxes, dropTarget;

	return {
		init: function () {
			this._dragBox = new DragBox( this );
		},
		events: {
			mousedown: function ( e ) {
				// 单选中根节点也不触发拖拽
				if ( e.getTargetNode() && e.getTargetNode() != this.getRoot() ) {
					this._dragBox.dragStart( e.getPosition() );
				}
			},
			'mousemove': function ( e ) {
				this._dragBox.dragMove( e.getPosition() );
			},
			'mouseup': function ( e ) {
				this._dragBox.dragEnd();
			}
		},
		commands: {
			'movetoparent': MoveToParentCommand
		}
	};
} );