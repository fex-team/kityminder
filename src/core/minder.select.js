// 选区管理
kity.extendClass( Minder, function () {
    function highlightNode( km, node ) {
        if( node ){
            node.setTmpData( "highlight", true );
            km.highlightNode( node );
        }
    }

    function unhighlightNode( km, node ) {
        if( node ){
            node.setTmpData( "highlight", false );
            km.highlightNode( node );
        }
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
            return this.fire( 'selectionclear' );
        },
        removeSelectedNodes: function ( nodes ) {
            var me = this;
            Utils.each( Utils.isArray( nodes ) ? nodes : [ nodes ], function ( i, n ) {
                var index;
                if ( ( index = me._selectedNodes.indexOf( n ) ) === -1 ) return;
                me._selectedNodes.splice( index, 1 );
                unhighlightNode( me, n );
            } );
            return this;
        },
        select: function ( nodes, isToggleSelect ) {
            if ( isToggleSelect ) {
                this.removeAllSelectedNodes();
            }
            var me = this;
            Utils.each( Utils.isArray( nodes ) ? nodes : [ nodes ], function ( i, n ) {
                if ( me._selectedNodes.indexOf( n ) !== -1 ) return;
                me._selectedNodes.push( n );
                highlightNode( me, n );
            } );
            return this;
        },

        isNodeSelected: function ( node ) {
            return node.getTmpData( 'highlight' ) === true;
        },
        //当前选区中的节点在给定的节点范围内的保留选中状态，
        //没在给定范围的取消选中，给定范围中的但没在当前选中范围的也做选中效果
        toggleSelect: function ( node ) {
            if ( Utils.isArray( node ) ) {
                node.forEach( this.toggleSelect.bind( this ) );
            } else {
                if ( node.isSelected() ) this.removeSelectedNodes( node );
                else this.select( node );
            }
            return this;
        },
        isSingleSelect: function () {
            return this._selectedNodes.length == 1;
        },
        getSelectedAncestors: function() {
            var nodes = this.getSelectedNodes().slice( 0 ),
            ancestors = [],
            judge;

            // 根节点不参与计算
            var rootIndex = nodes.indexOf( this.getRoot() );
            if ( ~rootIndex ) {
                nodes.splice( rootIndex, 1 );
            }

            // 判断 nodes 列表中是否存在 judge 的祖先
            function hasAncestor( nodes, judge ) {
                for ( var i = nodes.length - 1; i >= 0; --i ) {
                    if ( nodes[ i ].isAncestorOf( judge ) ) return true;
                }
                return false;
            }

            // 按照拓扑排序
            nodes.sort( function ( node1, node2 ) {
                return node1.getLevel() - node2.getLevel();
            } );

            // 因为是拓扑有序的，所以只需往上查找
            while ( ( judge = nodes.pop() ) ) {
                if ( !hasAncestor( nodes, judge ) ) {
                    ancestors.push( judge );
                }
            }

            return ancestors;
        }
    };
}() );