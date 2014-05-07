KityMinder.registerModule( "Expand", function () {
	var EXPAND_STATE_DATA = 'expandState',
		STATE_EXPAND = 'expand',
		STATE_COLLAPSE = 'collapse';


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
	var ExpandAllNodeCommand = kity.createClass( "ExpandAllNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				alert( '2' );
			},
			queryState: function ( km ) {
				return 0;
			}
		};
	} )() );
	var CollapseAllNodeCommand = kity.createClass( "ExpandAllNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				alert( '1' );
			},
			queryState: function ( km ) {
				return 0;
			}
		};
	} )() );
	return {
		'events': {
			'import': function ( e ) {
				//console.log( this.getRoot() );
			}
		},
		'commands': {
			'expand': ExpandAllNodeCommand,
			'contract': CollapseAllNodeCommand
		}
	};
} );