// 选区管理
kity.extendClass( Minder, function () {
    function highlightNode( km, node ) {
        node.setTmpData( "highlight", true );
        km.highlightNode( node );
    }

    function unhighlightNode( km, node ) {
        node.setTmpData( "highlight", false );
        km.highlightNode( node );
    }
    return {
        _initSelection: function () {
            this._selectedNodes = [];
        },
        getSelectedNodes: function () {
            //不能克隆返回，会对当前选区操作，从而影响querycommand
            return this._selectedNodes;
        },
        getSelectedNode: function () {
            return this.getSelectedNodes()[ 0 ] || null;
        },
        removeAllSelectedNodes: function () {
            var me = this;
            Utils.each( this.getSelectedNodes(), function ( i, n ) {
                unhighlightNode( me, n );
            } );
            this._selectedNodes = [];
        },
        removeSelectedNodes: function ( nodes ) {
            var me = this;
            Utils.each( Utils.isArray( nodes ) ? nodes : [ nodes ], function ( i, n ) {
                if ( me._selectedNodes.indexOf( n ) === -1 ) return;
                me._selectedNodes.splice( i, 1 );
                unhighlightNode( me, n );
            } );
            return this;
        },
        select: function ( nodes, isToggleSelect ) {
            isToggleSelect && this.removeAllSelectedNodes();
            var me = this;
            Utils.each( Utils.isArray( nodes ) ? nodes : [ nodes ], function ( i, n ) {
                if ( me._selectedNodes.indexOf( n ) !== -1 ) return;
                me._selectedNodes.push( n );
                highlightNode( me, n );
            } );
            return this;
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