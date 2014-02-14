Utils.extend( KityMinder, {
    _protocals: {},
    registerProtocal: function ( name, protocalDeal ) {
        KityMinder._protocals[ name ] = protocalDeal();
    },
    findProtocal: function ( name ) {
        return KityMinder._protocals[ name ] || null;
    },
    getSupportedProtocals: function () {
        return Utils.keys( KityMinder._protocals );
    },
    getAllRegisteredProtocals: function () {
        return KityMinder._protocals;
    }
} );

// 这里的 Json 是一个对象
function exportNode( node ) {
    var exported = {};
    exported.data = node.getData();
    var childNodes = node.getChildren();
    if ( childNodes.length ) {
        exported.children = [];
        for ( var i = 0; i < childNodes.length; i++ ) {
            exported.children.push( exportNode( childNodes[ i ] ) );
        }
    }
    return exported;
}

function importNode( node, json ) {
    var data = json.data;
    for ( var field in data ) {
        node.setData( field, data[ field ] );
    }
    node.setText( data.text );

    var childrenTreeData = json.children;
    if ( !childrenTreeData ) return;
    for ( var i = 0; i < childrenTreeData.length; i++ ) {
        var childNode = new MinderNode();
        importNode( childNode, childrenTreeData[ i ] );
        node.appendChild( childNode );
    }
    return node;
}

// 导入导出
kity.extendClass( Minder, {
    exportData: function ( protocalName ) {
        var json, protocal;

        json = exportNode( this.getRoot() );
        protocal = KityMinder.findProtocal( protocalName );
        if ( protocal ) {
            return protocal.encode( json );
        } else {
            return json;
        }
    },

    importData: function ( local, protocalName ) {
        var json, protocal;

        if ( protocalName ) {
            protocal = KityMinder.findProtocal( protocalName );
        } else {
            KityMinder.getSupportedProtocals().every( function ( name ) {
                var test = KityMinder.findProtocal( name );
                if ( test.recognize && test.recognize( local ) ) {
                    protocal = test;
                }
                return !test;
            } );
        }

        if ( !protocal ) {
            throw new Error( "Unsupported protocal: " + protocalName );
        }

        var params = {
            local: local,
            protocalName: protocalName,
            protocal: protocal
        };

        // 是否需要阻止导入
        var stoped = this._fire( new MinderEvent( 'beforeimport', params, true ) );
        if ( stoped ) return this;

        json = params.json || ( params.json = protocal.decode( local ) );

        this._fire( new MinderEvent( 'preimport', params, false ) );


        // 删除当前所有节点
        while ( this._root.getChildren().length ) {
            this._root.removeChild( 0 );
        }

        importNode( this._root, json );

        this._fire( new MinderEvent( 'import', params, false ) );
        this._firePharse( {
            type: 'contentchange'
        } );
        this._firePharse( {
            type: 'interactchange'
        } );

        return this;
    }
} );