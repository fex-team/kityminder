Utils.extend( KityMinder, {
    _protocals: {},
    registerProtocal: function ( name, protocalDeal ) {
        KityMinder._protocals[ name ] = protocalDeal();
    },
    findProtocal: function ( name ) {
        return KityMinder._protocals[ name ] || null;
    },
    getSupportedProtocals: function () {
        return Utils.keys( KityMinder._protocals ).sort( function ( a, b ) {
            return KityMinder._protocals[ b ].recognizePriority - KityMinder._protocals[ a ].recognizePriority;
        } );
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

var DEFAULT_TEXT = {
    'root': 'maintopic',
    'main': 'topic',
    'sub': 'topic'
};

function importNode( node, json, km ) {
    var data = json.data;
    for ( var field in data ) {
        node.setData( field, data[ field ] );
    }
    node.setData( 'text', data.text || km.getLang( DEFAULT_TEXT[ node.getType() ] ) );

    var childrenTreeData = json.children;
    if ( !childrenTreeData ) return;
    for ( var i = 0; i < childrenTreeData.length; i++ ) {
        var childNode = new MinderNode();
        node.appendChild( childNode );
        importNode( childNode, childrenTreeData[ i ], km );
    }
    return node;
}

// 导入导出
kity.extendClass( Minder, {
    exportData: function ( protocalName ) {
        var json, protocal;

        json = exportNode( this.getRoot() );
        protocal = KityMinder.findProtocal( protocalName );

        if ( this._fire( new MinderEvent( 'beforeexport', {
            json: json,
            protocalName: protocalName,
            protocal: protocal
        }, true ) ) === true ) return;

        if ( protocal ) {
            return protocal.encode( json, this );
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
                return !protocal;
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


        //*******************
        function ts( d, str, last ) {
            var h = d.getHours(),
                m = d.getMinutes(),
                s = d.getSeconds(),
                ms = d.getMilliseconds();

            if ( last ) {
                console.log( '--- ' + str + ': ' + ( d - last ) + ' ---' );
            } else {
                console.log( '--- ' + str + ' ---' );
            }

            return d;
        }

        var t1 = ts( new Date(), '开始解析' );
        //*******************

        json = params.json || ( params.json = protocal.decode( local ) );

        this._fire(new MinderEvent('importData',{
            data:json
        },true));

        if ( typeof json === 'object' && 'then' in json ) {
            var self = this;
            json.then( local, function ( data ) {
                //*******************
                var t2 = ts( new Date(), '解压解析耗时', t1 );
                //*******************
                self._afterImportData( data, params );
                //*******************
                ts( new Date(), '渲染耗时', t2 );
                //*******************
            } );
        } else {
            //*******************
            var t2 = ts( new Date(), '解压解析耗时', t1 );
            //*******************
            this._afterImportData( json, params );
            //*******************
            ts( new Date(), '渲染耗时', t2 );
            //*******************
        }
        return this;
    },

    _afterImportData: function ( json, params ) {
        this._fire( new MinderEvent( 'preimport', params, false ) );

        // 删除当前所有节点
        while ( this._root.getChildren().length ) {
            this._root.removeChild( 0 );
        }
        var curLayout = this._root.getData( "currentstyle" );
        this._root.setData();
        this._root.setData( "currentstyle", curLayout );
        importNode( this._root, json, this );

        this._fire( new MinderEvent( 'import', params, false ) );
        this._firePharse( {
            type: 'contentchange'
        } );
        this._firePharse( {
            type: 'interactchange'
        } );
    }

} );