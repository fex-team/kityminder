// 导入导出
kity.extendClass( Minder, {
    exportData: function ( node ) {
        var exported = {};
        node = node || this.getRoot();
        exported.data = node.getData();
        var childNodes = node.getChildren();
        if ( childNodes.length ) {
            exported.children = [];
            for ( var i = 0; i < childNodes.length; i++ ) {
                exported.children.push( this.exportData( childNodes[ i ] ) );
            }
        }
        return exported;
    },

    importData: function ( treeData ) {
        function importToNode( treeData, node ) {
            var data = treeData.data;
            for ( var field in data ) {
                node.setData( field, data[ field ] );
            }

            var childrenTreeData = treeData.children;
            if ( !childrenTreeData ) return;
            for ( var i = 0; i < childrenTreeData.length; i++ ) {
                var childNode = new MinderNode();
                importToNode( childrenTreeData[ i ], childNode );
                node.appendChild( childNode );
            }
        }

        var params = {
            importData: treeData
        };

        var stoped = this._fire( new MinderEvent( 'beforeimport', params, true ) );

        if ( stoped ) return this;

        this._fire( new MinderEvent( 'preimport', params, false ) );

        while ( this._root.getChildren().length ) {
            this._root.removeChild( 0 );
        }
        importToNode( treeData, this._root );

        this._fire( new MinderEvent( 'import', params, false ) );
        this._firePharse( {
            type: 'contentchange'
        } );
        return this;
    }
} );