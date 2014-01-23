// 选区管理
kity.extendClass( Minder, function () {
    function highlightNode( km, node ) {
        node.setData( "highlight", true );
        km.renderNode( node );
    }

    function unhighlightNode( km, node ) {
        node.setData( "highlight", false );
        km.renderNode( node );
    }
    return {
        _initSelection: function () {
            this._selectedNodes = [];
        },
        getSelectedNodes: function () {
            //如果没有选中节点，默认是root节点
            if ( this._selectedNodes.length === 0 ) {
                this._selectedNodes.push( this.getRoot() );
            }
            //不能克隆返回，会对当前选区操作，从而影响querycommand
            return this._selectedNodes;
        },
        getSelectedNode: function () {
            return this.getSelectedNodes()[ 0 ];
        },
        removeAllSelectedNodes: function () {
            var me = this;
            Utils.each( this.getSelectedNodes(), function ( i, n ) {
                unhighlightNode( me, n );
            } );
            this._selectedNodes = [];
        },
        select: function ( nodes ) {
            this.removeAllSelectedNodes();
            var me = this;
            Utils.each( Utils.isArray( nodes ) ? nodes : [ nodes ], function ( i, n ) {
                me._selectedNodes.push( n );
                highlightNode( me, n );
            } );
            return this;
        },
        addSelect: function ( node ) {
            var me = this;
            if ( me._selectedNodes.indexOf( node ) === -1 ) me._selectedNodes.push( node );
            highlightNode( me, node );
        },
        isNodeSelected: function ( node ) {
            return node.getData( 'highlight' ) === true;
        },
        //当前选区中的节点在给定的节点范围内的保留选中状态，没在给定范围的取消选中，给定范围中的但没在当前选中范围的也做选中效果
        toggleSelect: function ( nodes ) {
            nodes = Utils.isArray( nodes ) ? nodes : [ nodes ];
            var selectedNodes = this.getSelectedNodes().slice( 0 );
            this.removeAllSelectedNodes();
            for ( var i = 0, n; n = selectedNodes[ i ]; ) {
                var index = utils.indexOf( nodes, n );
                if ( index != -1 ) {
                    nodes.push( n );
                    i++;
                } else {
                    unhighlightNode( this, n );
                    selectedNodes.splice( i, 1 )
                }
            }
            var me = this;
            utils.each( nodes, function ( i, n ) {
                highlightNode( me, n )
            } );
            this._selectedNodes = nodes;
        },
        isSingleSelect: function () {
            return this._selectedNodes.length == 1
        }
    }
}() );