KityMinder.registerModule( "Expand", function () {
	var EXPAND_STATE_DATA = 'expandState',
		STATE_EXPAND = 'expand',
		STATE_COLLAPSE = 'collapse';

	/**
	 * 节点展开和收缩的策略常量
	 *
	 * 策略是一个处理函数，处理函数接受 3 个参数：
	 *
	 * @param {MinderNode} node   要处理的节点
	 * @param {Enum}       state  取值为 "expand" | "collapse"，表示要对节点进行的操作是展开还是收缩
	 * @param {Function}   policy 提供当前策略的函数，方便递归调用
	 */
	MinderNode.EXAPND_POLICY = {
		/**
		 * 策略 1：只修改当前节点的状态，不递归子节点的状态
		 */
		KEEP_STATE: function ( node, state, policy ) {
			node.setData( expandStateData, state === STATE_EXPAND );
		},

		/**
		 * 策略 2：该函数返回一个策略，表示递归到节点指定的层数
		 * 返回的策略表示把操作（展开/收起）进行到指定的层数
		 *
		 * @param {int} deep_level 指定的层数
		 */
		DEEP_TO_LEVEL: function ( deep_level ) {
			return function ( node, state, policy ) {

			};
		},
		DEEP_TO_CHILD: function () {

		},
		DEEP_TO_LEAVE: function () {

		}
	};

	kity.extendClass( MinderNode, {
		expand: function ( policy ) {
			node.setData( EXPAND_STATE_DATA, STATE_EXPAND );
		},
		collapse: function () {
			node.setData( EXPAND_STATE_DATA, STATE_COLLAPSE );
		},
		isExpanded: function () {
			return this.getData( EXPAND_STATE_DATA ) === STATE_EXPAND;
		}
	} );
	return {
		'events': {
			'importData': function ( e ) {
				// var data = e.data;
				// console.log( data );
				// var options = this.getOptions();
				// console.log( options );
			}
		},
		'commands': {}
	};
} );