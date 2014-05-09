KityMinder.registerModule( "Expand", function () {
	var minder = this;
	var EXPAND_STATE_DATA = 'expandState',
		STATE_EXPAND = 'expand',
		STATE_COLLAPSE = 'collapse';

	var layerTravel = function ( root, fn ) {
		var _buffer = [ root ];
		while ( _buffer.length !== 0 ) {
			fn( _buffer[ 0 ] );
			_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
			_buffer.shift();
		}
	}
	//获取选中的最上层节点
	var filterDuplicate = function ( nodes ) {
		var _buffer = ( [] ).concat( nodes );
		var resultSet = [];
		for ( var i = 0; i < _buffer.length; i++ ) {
			var parent = _buffer[ i ].getParent();
			if ( !parent ) {
				resultSet = [ _buffer[ i ] ];
				break;
			} else {
				//筛选
				while ( parent ) {
					if ( _buffer.indexOf( parent ) !== -1 ) {
						_buffer[ i ] = null;
						break;
					}
					parent = parent.getParent();
				}
				if ( _buffer[ i ] ) resultSet.push( _buffer[ i ] );
			}
		}
		return resultSet;
	}

	var expandAll = function ( km, deal ) {
		var selectedNodes = km.getSelectedNodes();
		var topNodes = filterDuplicate( selectedNodes );
		if ( selectedNodes.length === 0 || selectedNodes[ 0 ].getType() === 'root' || topNodes[ 0 ].getType() === 'root' ) {
			layerTravel( km.getRoot(), function ( n ) {
				if ( deal === 'expand' ) n.expand();
				else n.collapse();
			} );
			km.initStyle();
		} else {
			for ( var i = 0; i < topNodes.length; i++ ) {
				var node = topNodes[ i ];
				var children = node.getChildren();
				if ( children.length === 0 ) {
					continue;
				} else {
					layerTravel( node, function ( n ) {
						if ( n !== node ) {
							if ( deal === 'expand' ) n.expand();
							else n.collapse();
						}
					} );
					var judge_val;
					if ( deal === 'expand' ) {
						judge_val = !node.isExpanded();
					} else {
						judge_val = node.isExpanded();
					}
					if ( judge_val ) {
						km.expandNode( node );
					} else {
						km.expandNode( node );
						km.expandNode( node );
					}
				}
			}
		}
		for ( var j = 0; j < selectedNodes.length; j++ ) {
			km.highlightNode( selectedNodes[ j ] );
		}
	}

	// var setOptionValue = function ( root, layer, sub ) {
	// 	var cur_layer = 1;
	// 	var _buffer = root.getChildren();
	// 	while ( cur_layer < layer ) {
	// 		var layer_len = _buffer.length;
	// 		for ( var i = 0; i < layer_len; i++ ) {
	// 			var c = _buffer[ i ].getChildren();
	// 			if ( c.length < sub || ( !sub ) ) {
	// 				_buffer[ i ].expand();
	// 				_buffer = _buffer.concat( c );
	// 			}
	// 		}
	// 		_buffer.splice( 0, layer_len );
	// 		cur_layer++;
	// 	}
	// }
	/**
	 * 该函数返回一个策略，表示递归到节点指定的层数
	 *
	 * 返回的策略表示把操作（展开/收起）进行到指定的层数
	 * 也可以给出一个策略指定超过层数的节点如何操作，默认不进行任何操作
	 *
	 * @param {int} deep_level 指定的层数
	 * @param {Function} policy_after_level 超过的层数执行的策略
	 */
		function generateDeepPolicy( deep_level, policy_after_level ) {

			return function ( node, state, policy, level ) {
				var children, child, i;

				node.setData( EXPAND_STATE_DATA, state );
				level = level || 1;

				children = node.getChildren();

				for ( i = 0; i < children.length; i++ ) {
					child = children[ i ];

					if ( level <= deep_level ) {
						policy( child, state, policy, level + 1 );
					} else if ( policy_after_level ) {
						policy_after_level( child, state, policy, level + 1 );
					}
				}

			};
		}

		/**
		 * 节点展开和收缩的策略常量
		 *
		 * 策略是一个处理函数，处理函数接受 3 个参数：
		 *
		 * @param {MinderNode} node   要处理的节点
		 * @param {Enum}       state  取值为 "expand" | "collapse"，表示要对节点进行的操作是展开还是收缩
		 * @param {Function}   policy 提供当前策略的函数，方便递归调用
		 */
	var EXPAND_POLICY = MinderNode.EXPAND_POLICY = {

		/**
		 * 策略 1：只修改当前节点的状态，不递归子节点的状态
		 */
		KEEP_STATE: function ( node, state, policy ) {
			node.setData( EXPAND_STATE_DATA, state );
		},

		generateDeepPolicy: generateDeepPolicy,

		/**
		 * 策略 2：把操作进行到儿子
		 */
		DEEP_TO_CHILD: generateDeepPolicy( 1 ),

		/**
		 * 策略 3：把操作进行到叶子
		 */
		DEEP_TO_LEAF: generateDeepPolicy( Number.MAX_VALUE )
	};

	// 将展开的操作和状态读取接口拓展到 MinderNode 上
	kity.extendClass( MinderNode, {

		/**
		 * 使用指定的策略展开节点
		 * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
		 */
		expand: function ( policy ) {
			policy = policy || EXPAND_POLICY.KEEP_STATE;
			policy( this, STATE_EXPAND, policy );
			return this;
		},

		/**
		 * 使用指定的策略收起节点
		 * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
		 */
		collapse: function ( policy ) {
			policy = policy || EXPAND_POLICY.KEEP_STATE;
			policy( this, STATE_COLLAPSE, policy );
			return this;
		},

		/**
		 * 判断节点当前的状态是否为展开
		 */
		isExpanded: function () {
			return this.getData( EXPAND_STATE_DATA ) === STATE_EXPAND;
		}
	} );
	var ExpandNodeCommand = kity.createClass( "ExpandNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				expandAll( km, 'expand' );
			},
			queryState: function ( km ) {
				return 0;
			}
		};
	} )() );
	var CollapseNodeCommand = kity.createClass( "CollapseNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				expandAll( km, 'collapse' );
			},
			queryState: function ( km ) {
				return 0;
			}
		};
	} )() );
	return {
		'events': {
			'beforeimport': function ( e ) {
				// var _root = this.getRoot();
				// var options = this.getOptions();
				// var defaultExpand = options.defaultExpand;
				//setOptionValue( _root, defaultExpand.defaultLayer, defaultExpand.defaultSubShow );
			}
		},
		'addShortcutKeys': {
			"ExpandNode": "ctrl+/", //expand
			"CollapseNode": "ctrl+." //collapse
		},
		'commands': {
			'ExpandNode': ExpandNodeCommand,
			'CollapseNode': CollapseNodeCommand
		}

	};
} );