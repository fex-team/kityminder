var KityMinder =
    window.KM =
    window.KityMinder = function(){
        var instanceMap = {}, instanceId = 0;
        return {
            version : '1.0.0',
            createMinder : function ( renderTarget, options ) {
                options = options || {};
                options.renderTo = Utils.isString( renderTarget ) ? document.getElementById( renderTarget ) : renderTarget;
                var minder = new Minder( options );
                this.addMinder(options.renderTo,minder);
                return minder;
            },
            addMinder :  function ( target, minder ) {
                var id;
                if ( typeof ( target ) === 'string' ) {
                    id = target;
                } else {
                    id = target.id || ( "KM_INSTANCE_" + instanceId++ );
                }
                instanceMap[ id ] = minder;
            },
            getMinder : function(target,options){
                var id;
                if ( typeof ( target ) === 'string' ) {
                    id = target;
                } else {
                    id = target.id || ( "KM_INSTANCE_" + instanceId++ );
                }
                return instanceMap[ id ] || this.createMinder(target,options);
            },
            //挂接多语言
            LANG:{}
        }
    }();



var utils = Utils = KityMinder.Utils = {
    extend: kity.Utils.extend.bind( kity.Utils ),

    listen: function ( element, type, handler ) {
        var types = utils.isArray( type ) ? type : utils.trim( type ).split( /\s+/ ),
            k = types.length;
        if ( k )
            while ( k-- ) {
                type = types[ k ];
                if ( element.addEventListener ) {
                    element.addEventListener( type, handler, false );
                } else {
                    if ( !handler._d ) {
                        handler._d = {
                            els: []
                        };
                    }
                    var key = type + handler.toString(),
                        index = utils.indexOf( handler._d.els, element );
                    if ( !handler._d[ key ] || index == -1 ) {
                        if ( index == -1 ) {
                            handler._d.els.push( element );
                        }
                        if ( !handler._d[ key ] ) {
                            handler._d[ key ] = function ( evt ) {
                                return handler.call( evt.srcElement, evt || window.event );
                            };
                        }
                        element.attachEvent( 'on' + type, handler._d[ key ] );
                    }
                }
            }
        element = null;
    },
    trim: function ( str ) {
        return str.replace( /(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '' );
    },
    each: function ( obj, iterator, context ) {
        if ( obj == null ) return;
        if ( obj.length === +obj.length ) {
            for ( var i = 0, l = obj.length; i < l; i++ ) {
                if ( iterator.call( context, i, obj[ i ], obj ) === false )
                    return false;
            }
        } else {
            for ( var key in obj ) {
                if ( obj.hasOwnProperty( key ) ) {
                    if ( iterator.call( context, key, obj[ key ], obj ) === false )
                        return false;
                }
            }
        }
    },
    addCssRule: function ( key, style, doc ) {
        var head, node;
        if ( style === undefined || style && style.nodeType && style.nodeType == 9 ) {
            //获取样式
            doc = style && style.nodeType && style.nodeType == 9 ? style : ( doc || document );
            node = doc.getElementById( key );
            return node ? node.innerHTML : undefined;
        }
        doc = doc || document;
        node = doc.getElementById( key );

        //清除样式
        if ( style === '' ) {
            if ( node ) {
                node.parentNode.removeChild( node );
                return true
            }
            return false;
        }

        //添加样式
        if ( node ) {
            node.innerHTML = style;
        } else {
            node = doc.createElement( 'style' );
            node.id = key;
            node.innerHTML = style;
            doc.getElementsByTagName( 'head' )[ 0 ].appendChild( node );
        }
    },
    keys: function ( plain ) {
        var keys = [];
        for ( var key in plain ) {
            if ( plain.hasOwnProperty( key ) ) {
                keys.push( key );
            }
        }
        return keys;
    },
    proxy: function ( fn, context ) {
        return function () {
            return fn.apply( context, arguments );
        };
    },
    indexOf: function ( array, item, start ) {
        var index = -1;
        start = this.isNumber( start ) ? start : 0;
        this.each( array, function ( v, i ) {
            if ( i >= start && v === item ) {
                index = i;
                return false;
            }
        } );
        return index;
    },
    argsToArray: function ( args,index ) {
        return Array.prototype.slice.call( args, index || 0 );
    },
    clonePlainObject:function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (utils.isObject(tmp) || utils.isArray(tmp)) {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clonePlainObject(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    compareObject:function(source,target){
        var tmp;
        if(this.isEmptyObject(source) !== this.isEmptyObject(target)){
            return false
        }
        if(this.getObjectLength(source) != this.getObjectLength(target)){
            return false;
        }
        for(var p in source){
            if(source.hasOwnProperty(p)){
                tmp = source[p];
                if(target[p] === undefined){
                    return false;
                }
                if (this.isObject(tmp) || this.isArray(tmp)) {
                    if(this.isObject(target[p]) !== this.isObject(tmp)){
                        return false;
                    }
                    if(this.isArray(tmp) !== this.isArray(target[p])){
                        return false;
                    }
                    if(this.compareObject(tmp, target[p]) === false){
                        return false
                    }
                } else {
                    if(tmp != target[p]){
                        return false
                    }
                }
            }
        }
        return true;
    },
    getObjectLength:function(obj){
        if (this.isArray(obj) || this.isString(obj)) return obj.length;
        var count = 0;
        for (var key in obj) if (obj.hasOwnProperty(key)) count++;
        return count;
    },
    isEmptyObject:function (obj) {
        if (obj == null) return true;
        if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
        for (var key in obj) if (obj.hasOwnProperty(key)) return false;
        return true;
    },
    getNodeCommonAncestor : function(nodeA,nodeB){
        if ( nodeA === nodeB ) {
            return nodeA.parent
        }
        if ( nodeA.contains( nodeB ) ) {
            return this
        }
        if ( nodeB.contains( nodeA ) ) {
            return nodeB
        }
        var parent = nodeA.parent;
        while ( !parent.contains( nodeB ) ) {
            parent = parent.parent;
        }
        return parent;
    }

};

Utils.each( [ 'String', 'Function', 'Array', 'Number', 'RegExp', 'Object' ], function ( i, v ) {
    KityMinder.Utils[ 'is' + v ] = function ( obj ) {
        return Object.prototype.toString.apply( obj ) == '[object ' + v + ']';
    }
} );

var Command = kity.createClass( "Command", {
    constructor: function () {
        this._isContentChange = true;
        this._isSelectionChange = false;
    },

    execute: function ( minder, args ) {

    },

    setContentChanged: function ( val ) {
        this._isContentChange = !! val;
    },

    isContentChanged: function () {
        return this._isContentChange;
    },

    setSelectionChanged: function ( val ) {
        this._isSelectionChange = !! val;
    },

    isSelectionChanged: function () {
        return this._isContentChange;
    },

    queryState: function ( km ) {
        return 0;
    },

    queryValue: function ( km ) {
        return 0;
    },
    isNeedUndo: function () {
        return true;
    }
} );

var MinderNode = KityMinder.MinderNode = kity.createClass( "MinderNode", {
    constructor: function ( options ) {
        this.parent = null;
        this.children = [];
        this.data = {};
        this.tmpData = {};
        if ( Utils.isString( options ) ) {
            this.setData( 'text', options );
        } else {
            this.setData( options );
        }
        this._createShapeDom();
        this.setData( "layout", {} );
    },
    _createShapeDom: function () {
        this.rc = new kity.Group();
        this.rc.addClass( 'km-minderNode' );
        this.rc.minderNode = this;

        this._createBgGroup();
        this._createContGroup();
        this._createIconShape();
        this._createTextShape();
    },
    _createGroup: function ( type ) {
        var g = new kity.Group();
        g.setData( 'rctype', type );
        this.rc.appendShape( g );
    },
    _createBgGroup: function () {
        this._createGroup( 'bgrc' );
    },
    _createContGroup: function () {
        this._createGroup( 'contrc' );
    },
    _createTextShape: function () {
        var textShape = new kity.Text( this.getData( 'text' ) || '' );
        textShape.setAttr('_nodeTextShape',true);
        this.getContRc().appendShape( textShape );
    },
    _createIconShape: function () {
        var g = new kity.Group();
        this.getContRc().appendShape( g );
        this._iconRc = g;
    },
    getContRc: function () {
        var groups = this.rc.getShapesByType( 'group' ),
            result;
        Utils.each( groups, function ( i, p ) {
            if ( p.getData( 'rctype' ) == 'contrc' ) {
                result = p;
                return false;
            }
        } );
        return result;
    },
    getBgRc: function () {
        var groups = this.rc.getShapesByType( 'group' ),
            result;
        Utils.each( groups, function ( i, p ) {
            if ( p.getData( 'rctype' ) == 'bgrc' ) {
                result = p;
                return false;
            }
        } );
        return result;
    },
    getIconRc: function () {
        return this._iconRc;
    },
    setPoint: function ( x, y ) {
        this.setData( 'point', {
            x: x,
            y: y
        } );
    },
    getPoint: function () {
        return this.getData( 'point' );
    },
    setType: function ( type ) {
        this.setData( 'type', type );
    },
    getLevel: function () {
        var level = 0,
            parent = this.parent;
        while ( parent ) {
            level++;
            parent = parent.parent;
        }
        return level;
    },
    getType: function ( type ) {
        var cached = this.getData( 'type' );
        if ( cached ) {
            return cached;
        }
        var level = Math.min( this.getLevel(), 2 );
        cached = [ 'root', 'main', 'sub' ][ level ];
        this.setData( 'type', cached );
        return cached;
    },
    setText: function ( text ) {
        this.setData( 'text', text );
        this.getTextShape().setContent( text );
    },
    getText: function () {
        return this.getData( 'text' );
    },
    isRoot: function () {
        return this.getParent() === null ? true : false;
    },
    getParent: function () {
        return this.parent;
    },

    getDepth: function () {
        var depth = 0,
            p = this.parent;
        while ( p ) {
            p = p.parent;
            depth++;
        }
        return depth;
    },

    getRoot: function () {
        var root = this;
        while ( root.parent ) {
            root = root.parent;
        }
        return root;
    },

    isAncestorOf: function ( test ) {
        var p = test.parent;
        while ( p ) {
            if ( p == this ) return true;
            p = p.parent;
        }
        return false;
    },

    preTraverse: function ( fn ) {
        var children = this.getChildren();
        fn( this );
        for ( var i = 0; i < children.length; i++ ) {
            children[ i ].preTraverse( fn );
        }
    },

    postTraverse: function ( fn ) {
        var children = this.getChildren();
        for ( var i = 0; i < children.length; i++ ) {
            children[ i ].postTraverse( fn );
        }
        fn( this );
    },

    traverse: function ( fn ) {
        return this.postTraverse( fn );
    },

    getChildren: function () {
        return this.children;
    },

    getIndex: function () {
        return this.parent ? this.parent.children.indexOf( this ) : -1;
    },

    insertChild: function ( node, index ) {
        if ( index === undefined ) {
            index = this.children.length;
        }
        if ( node.parent ) {
            node.parent.removeChild( node );
        }
        node.parent = this;
        node.root = parent.root;

        this.children.splice( index, 0, node );
    },

    appendChild: function ( node ) {
        return this.insertChild( node );
    },

    prependChild: function ( node ) {
        return this.insertChild( node, 0 );
    },

    removeChild: function ( elem ) {
        var index = elem,
            removed;
        if ( elem instanceof MinderNode ) {
            index = this.children.indexOf( elem );
        }
        if ( index >= 0 ) {
            removed = this.children.splice( index, 1 )[ 0 ];
            removed.parent = null;
            //            this.handelRemove( removed );
        }
    },

    //    handelRemove: function ( node ) {
    //        var root = this.getRoot();
    //        if ( root.tnh ) {
    //            root.tnh.handelNodeRemove.call( root.tnh, node );
    //        }
    //    },

    getChild: function ( index ) {
        return this.children[ index ];
    },
    getFirstChild: function () {
        return this.children[ 0 ];
    },
    getLastChild: function () {
        return this.children[ this.children.length - 1 ];
    },
    getData: function ( name ) {
        if ( name === undefined ) {
            return this.data;
        }
        return this.data[ name ];
    },

    setData: function ( name, value ) {
        if ( name === undefined ) {
            this.data = {};

        } else if ( utils.isObject( name ) ) {
            Utils.extend( this.data, name );
        } else {
            if ( value === undefined ) {
                this.data[ name ] = null;
                delete this.data[ name ];
            } else {
                this.data[ name ] = value;
            }
        }
    },
    getRenderContainer: function () {
        return this.rc;
    },
    getCommonAncestor: function ( node ) {
        return Utils.getNodeCommonAncestor( this, node );
    },
    contains: function ( node ) {
        if ( this === node ) {
            return true;
        }
        if ( this === node.parent ) {
            return true;
        }
        var isContain = false;
        Utils.each( this.getChildren(), function ( i, n ) {
            isContain = n.contains( node );
            if ( isContain === true ) {
                return false;
            }
        } );
        return isContain;

    },
    clone: function () {
        function cloneNode( parent, isClonedNode ) {
            var _tmp = new KM.MinderNode( isClonedNode.getText() );

            _tmp.data = Utils.clonePlainObject( isClonedNode.getData() );
            _tmp.tmpData = Utils.clonePlainObject( isClonedNode.getTmpData() )
            _tmp.parent = parent;
            if ( parent ) {
                parent.children.push( _tmp );
            }
            for ( var i = 0, ci;
                ( ci = isClonedNode.children[ i++ ] ); ) {
                cloneNode( _tmp, ci );
            }
            return _tmp;
        }
        return function () {
            return cloneNode( null, this );
        };
    }(),
    equals: function ( node ) {
        if ( node.children.length != this.children.length ) {
            return false;
        }
        if ( utils.compareObject( node.getData(), this.getData() ) === false ) {
            return false;
        }
        if ( utils.compareObject( node.getTmpData(), this.getTmpData() ) === false ) {
            return false;
        }
        for ( var i = 0, ci;
            ( ci = this.children[ i ] ); i++ ) {
            if ( ci.equals( node.children[ i ] ) === false ) {
                return false;
            }
        }
        return true;

    },
    getTextShape: function () {
        var textShape;
        utils.each(this.getContRc().getShapesByType( 'text' ),function(i,t){
            if(t.getAttr('_nodeTextShape')){
                textShape = t;
                return false;
            }
        });
        return textShape;
    },
    isSelected: function () {
        return this.getTmpData( 'highlight' ) === true;
    },
    clearChildren: function () {
        this.children = [];
    },
    isHighlight: function () {
        return this.getTmpData( 'highlight' )
    },
    setTmpData: function ( a, v ) {
        var me = this;
        if ( utils.isObject( a ) ) {
            utils.each( a, function ( val, key ) {
                me.setTmpData( key, val )
            } )
        }
        if ( v === undefined || v === null || v === '' ) {
            delete this.tmpData[ a ];
        } else {
            this.tmpData[ a ] = v;
        }
    },
    getTmpData: function ( a ) {
        if ( a === undefined ) {
            return this.tmpData;
        }
        return this.tmpData[ a ]
    }
} );

//模块注册&暴露模块接口
( function () {
    var _modules;
    KityMinder.registerModule = function ( name, module ) {
        //初始化模块列表
        if ( !_modules ) {
            _modules = {};
        }
        _modules[ name ] = module;
    };
    KityMinder.getModules = function () {
        return _modules;
    };
} )();

var MinderEvent = kity.createClass( 'MindEvent', {
    constructor: function ( type, params, canstop ) {
        params = params || {};
        if ( params.getType && params.getType() == 'ShapeEvent' ) {
            this.kityEvent = params;
            this.originEvent = params.originEvent;
            this.getPosition = params.getPosition.bind( params );
        } else if ( params.target && params.preventDefault ) {
            this.originEvent = params;
        } else {
            kity.Utils.extend( this, params );
        }
        this.type = type;
        this._canstop = canstop || false;
    },

    getTargetNode: function () {
        var findShape = this.kityEvent && this.kityEvent.targetShape;
        if ( !findShape ) return null;
        while ( !findShape.minderNode && findShape.container ) {
            findShape = findShape.container;
        }
        return findShape.minderNode || null;
    },

    stopPropagation: function () {
        this._stoped = true;
    },

    stopPropagationImmediately: function () {
        this._immediatelyStoped = true;
        this._stoped = true;
    },

    shouldStopPropagation: function () {
        return this._canstop && this._stoped;
    },

    shouldStopPropagationImmediately: function () {
        return this._canstop && this._immediatelyStoped;
    },
    preventDefault:function(){
        this.originEvent.preventDefault();
    }
} );

/* @require <kityminder.js>
 * @require <module.js>
 * @require <event.js>
 * @require <node.js>
 * @reuqire <command.js>
 * @require <utils.js>
 *
 * @description KityMinder 使用类
 */

var Minder = KityMinder.Minder = kity.createClass( "KityMinder", {
    constructor: function ( options ) {
        this._options = Utils.extend( window.KITYMINDER_CONFIG || {}, options );
        this.setDefaultOptions( KM.defaultOptions );
        this._initEvents();
        this._initMinder();
        this._initSelection();
        this._initShortcutKey();
        this._initModules();

        this.fire( 'ready' );
    },
    getOptions: function ( key ) {
        return this._options[ key ];
    },
    setDefaultOptions: function ( key, val ) {
        var obj = {};
        if ( Utils.isString( key ) ) {
            obj[ key ] = val;
        } else {
            obj = key;
        }
        utils.extend( this._options, obj, true );
    },
    _initMinder: function () {

        this._paper = new kity.Paper();
        this._paper.getNode().setAttribute( 'contenteditable', true );

        this._addRenderContainer();

        this._root = new MinderNode( "Main Topic" );
        this._root.setType( "root" );
        if ( this._options.renderTo ) {
            this.renderTo( this._options.renderTo );
        }
    },
    _addRenderContainer: function () {
        this._rc = new kity.Group();
        this._paper.addShape( this._rc );
    },

    renderTo: function ( target ) {
        this._paper.renderTo( this._renderTarget = target );
        this._bindEvents();
    },

    getRenderContainer: function () {
        return this._rc;
    },

    getPaper: function () {
        return this._paper;
    },
    getRenderTarget: function () {
        return this._renderTarget;
    },
    _initShortcutKey: function () {
        this._shortcutkeys = {};
        this._bindshortcutKeys();
    },
    addShortcutKeys: function ( cmd, keys ) {
        var obj = {};
        if ( keys ) {
            obj[ cmd ] = keys
        } else {
            obj = cmd;
        }
        utils.extend( this._shortcutkeys, obj )
    },
    _bindshortcutKeys: function () {
        var me = this,
            shortcutkeys = this._shortcutkeys;
        me.on( 'keydown', function ( e ) {

            var originEvent = e.originEvent;
            var keyCode = originEvent.keyCode || originEvent.which;
            for ( var i in shortcutkeys ) {
                var tmp = shortcutkeys[ i ].split( ',' );
                for ( var t = 0, ti; ti = tmp[ t++ ]; ) {
                    ti = ti.split( ':' );
                    var key = ti[ 0 ],
                        param = ti[ 1 ];
                    if ( /^(ctrl)(\+shift)?\+(\d+)$/.test( key.toLowerCase() ) || /^(\d+)$/.test( key ) ) {
                        if ( ( ( RegExp.$1 == 'ctrl' ? ( originEvent.ctrlKey || originEvent.metaKey ) : 0 ) && ( RegExp.$2 != "" ? originEvent[ RegExp.$2.slice( 1 ) + "Key" ] : 1 ) && keyCode == RegExp.$3 ) ||
                            keyCode == RegExp.$1
                        ) {
                            if ( me.queryCommandState( i, param ) != -1 )
                                me.execCommand( i, param );
                            e.preventDefault();
                        }
                    }
                }

            }
        } );
    }
} );

/**
 * @include <minder.data.js>
 * @include <minder.event.js>
 * @include <minder.module.js>
 * @include <minder.node.js>
 * @include <minder.select.js>
 */

Utils.extend( KityMinder, {
    _protocals: {},
    registerProtocal: function ( name, protocalDeal ) {
        KityMinder._protocals[ name ] = protocalDeal();
    },
    findProtocal: function ( name ) {
        return KityMinder._protocals[ name ] || null;
    },
    getSupportedProtocals: function () {
        return Utils.keys( KityMinder._protocals ).sort(function(a, b) {
            return KityMinder._protocals[b].recognizePriority - KityMinder._protocals[a].recognizePriority;
        });
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

// 事件机制
kity.extendClass( Minder, {
    _initEvents: function () {
        this._eventCallbacks = {};
    },
    _bindEvents: function () {
        this._bindPaperEvents();
        this._bindKeyboardEvents();
    },
    _resetEvents: function () {
        this._initEvents();
        this._bindEvents();
    },
    // TODO: mousemove lazy bind
    _bindPaperEvents: function () {
        this._paper.on( 'click mousedown mouseup mousemove mousewheel touchstart touchmove touchend', this._firePharse.bind( this ) );
        if ( window ) {
            window.addEventListener( 'resize', this._firePharse.bind( this ) );
        }
    },
    _bindKeyboardEvents: function () {
        if ( ( navigator.userAgent.indexOf( 'iPhone' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPod' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPad' ) == -1 ) ) {
            //只能在这里做，要不无法触发
            Utils.listen( document.body, 'keydown keyup keypress', this._firePharse.bind( this ) );
        }
    },
    _firePharse: function ( e ) {
        var beforeEvent, preEvent, executeEvent;

        beforeEvent = new MinderEvent( 'before' + e.type, e, true );
        if ( this._fire( beforeEvent ) ) {
            return;
        }
        preEvent = new MinderEvent( 'pre' + e.type, e, false );
        executeEvent = new MinderEvent( e.type, e, false );

        this._fire( preEvent );
        this._fire( executeEvent );
        this._fire( new MinderEvent( 'after' + e.type, e, false ) );

        if ( ~'mousedown mouseup keydown keyup'.indexOf( e.type ) ) {
            this._interactChange( e );
        }
    },
    _interactChange: function ( e ) {
        var minder = this;
        clearTimeout( this._interactTimeout );
        this._interactTimeout = setTimeout( function () {
            var stoped = minder._fire( new MinderEvent( 'beforeinteractchange' ) );
            if ( stoped ) {
                return;
            }
            minder._fire( new MinderEvent( 'preinteractchange' ) );
            minder._fire( new MinderEvent( 'interactchange' ) );
        }, 300 );
    },
    _listen: function ( type, callback ) {
        var callbacks = this._eventCallbacks[ type ] || ( this._eventCallbacks[ type ] = [] );
        callbacks.push( callback );
    },
    _fire: function ( e ) {
        var callbacks = this._eventCallbacks[ e.type.toLowerCase() ];
        if ( !callbacks ) {
            return false;
        }
        for ( var i = 0; i < callbacks.length; i++ ) {
            callbacks[ i ].call( this, e );
            if ( e.shouldStopPropagationImmediately() ) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function ( name, callback ) {
        var types = name.split( ' ' );
        for ( var i = 0; i < types.length; i++ ) {
            this._listen( types[ i ].toLowerCase(), callback );
        }
        return this;
    },
    off: function ( name, callback ) {
        var types = name.split( ' ' );
        var i, j, callbacks, removeIndex;
        for ( i = 0; i < types.length; i++ ) {
            callbacks = this._eventCallbacks[ types[ i ].toLowerCase() ];
            if ( callbacks ) {
                removeIndex = null;
                for ( j = 0; j < callbacks.length; j++ ) {
                    if ( callbacks[ j ] == callback ) {
                        removeIndex = j;
                    }
                }
                if ( removeIndex !== null ) {
                    callbacks.splice( removeIndex, 1 );
                }
            }
        }
    },
    fire: function ( type, params ) {
        var e = new MinderEvent( type, params );
        this._fire( e );
        return this;
    }
} );

// 模块声明周期维护
kity.extendClass( Minder, {
    _initModules: function () {
        var modulesPool = KityMinder.getModules();
        var modulesToLoad = this._options.modules || Utils.keys( modulesPool );

        this._commands = {};
        this._query = {};
        this._modules = {};

        var i, name, module, moduleDeals, dealCommands, dealEvents;

        var me = this;
        for ( i = 0; i < modulesToLoad.length; i++ ) {
            name = modulesToLoad[ i ];

            if ( !modulesPool[ name ] ) continue;

            //执行模块初始化，抛出后续处理对象
            moduleDeals = modulesPool[ name ].call( me );
            this._modules[ name ] = moduleDeals;

            if ( moduleDeals.init ) {
                moduleDeals.init.call( me, this._options );
            }

            //command加入命令池子
            dealCommands = moduleDeals.commands;
            for ( var name in dealCommands ) {
                this._commands[ name.toLowerCase() ] = new dealCommands[ name ];
            }

            //绑定事件
            dealEvents = moduleDeals.events;
            if ( dealEvents ) {
                for ( var type in dealEvents ) {
                    me.on( type, dealEvents[ type ] );
                }
            }

            if(moduleDeals.defaultOptions){
                this.setDefaultOptions(moduleDeals.defaultOptions);
            }
            //添加模块的快捷键
            if(moduleDeals.addShortcutKeys){
                this.addShortcutKeys(moduleDeals.addShortcutKeys)
            }

        }
    },

    _garbage: function () {
        this.clearSelect();

        while ( this._root.getChildren().length ) {
            this._root.removeChild( 0 );
        }
    },

    destroy: function () {
        var modules = this._modules;

        this._resetEvents();
        this._garbage();

        for ( var key in modules ) {
            if ( !modules[ key ].destroy ) continue;
            modules[ key ].destroy.call( this );
        }
    },

    reset: function () {
        var modules = this._modules;

        this._garbage();

        for ( var key in modules ) {
            if ( !modules[ key ].reset ) continue;
            modules[ key ].reset.call( this );
        }
    }
} );

kity.extendClass( Minder, {
    _getCommand: function ( name ) {
        return this._commands[ name.toLowerCase() ];
    },

    _queryCommand: function ( name, type, args ) {
        var cmd = this._getCommand( name );
        if ( cmd ) {
            var queryCmd = cmd[ 'query' + type ];
            if ( queryCmd )
                return queryCmd.apply( cmd, [ this ].concat( args ) );
        }
        return 0;
    },

    queryCommandState: function ( name ) {
        return this._queryCommand( name, "State", Utils.argsToArray( 1 ) );
    },

    queryCommandValue: function ( name ) {
        return this._queryCommand( name, "Value", Utils.argsToArray( 1 ) );
    },

    execCommand: function ( name ) {
        name = name.toLowerCase();

        var cmdArgs = Utils.argsToArray( arguments, 1 ),
            cmd, stoped, result, eventParams;
        var me = this;
        cmd = this._getCommand( name );

        eventParams = {
            command: cmd,
            commandName: name.toLowerCase(),
            commandArgs: cmdArgs
        };
        if ( !cmd ) {
            return false;
        }

        if ( !this._hasEnterExecCommand && cmd.isNeedUndo() ) {
            this._hasEnterExecCommand = true;
            stoped = this._fire( new MinderEvent( 'beforeExecCommand', eventParams, true ) );

            if ( !stoped ) {
                //保存场景
                this._fire( new MinderEvent( 'saveScene' ) );

                this._fire( new MinderEvent( "preExecCommand", eventParams, false ) );

                result = cmd.execute.apply( cmd, [ me ].concat( cmdArgs ) );

                this._fire( new MinderEvent( 'execCommand', eventParams, false ) );

                //保存场景
                this._fire( new MinderEvent( 'saveScene' ) );

                if ( cmd.isContentChanged() ) {
                    this._firePharse( new MinderEvent( 'contentchange' ) );
                }
                if ( cmd.isSelectionChanged() ) {
                    this._firePharse( new MinderEvent( 'selectionchange' ) );
                }
                this._firePharse( new MinderEvent( 'interactchange' ) );
            }
            this._hasEnterExecCommand = false;
        } else {
            result = cmd.execute.apply( cmd, [ me ].concat( cmdArgs ) );
        }

        return result === undefined ? null : result;
    }
} );

kity.extendClass( Minder, {

    getRoot: function () {
        return this._root;
    },
    setRoot: function ( root ) {
        this._root = root;
    },
    handelNodeInsert: function ( node ) {
        var rc = this._rc;
        node.traverse( function ( current ) {
            rc.addShape( current.getRenderContainer() );
        } );
    },

    handelNodeRemove: function ( node ) {
        var rc = this._rc;
        node.traverse( function ( current ) {
            rc.removeShape( current.getRenderContainer() );
        } );
    },
    renderNodes: function ( nodes ) {
        var km = this;
        if ( nodes instanceof Array ) {
            if ( nodes.length === 0 ) return false;
            for ( var i = 0; i < nodes.length; i++ ) {
                km.renderNode( nodes[ i ] );
            }
        } else {
            km.renderNode( nodes );
        }
    }

} );

var keymap = KityMinder.keymap  = {
    'Backspace' : 8,
    'Tab' : 9,
    'Enter' : 13,

    'Shift':16,
    'Control':17,
    'Alt':18,
    'CapsLock':20,

    'Esc':27,

    'Spacebar':32,

    'PageUp':33,
    'PageDown':34,
    'End':35,
    'Home':36,

    'Left':37,
    'Up':38,
    'Right':39,
    'Down':40,

    'Insert':45,

    'Del':46,

    'NumLock':144,

    'Cmd':91
};

//添加多语言模块
kity.extendClass( Minder, {
    getLang:function(path){

        var lang = KM.LANG[this.getOptions('lang')];
        if (!lang) {
            throw Error("not import language file");
        }
        path = (path || "").split(".");
        for (var i = 0, ci; ci = path[i++];) {
            lang = lang[ci];
            if (!lang)break;
        }
        return lang;
    }
} );

//这里只放不是由模块产生的默认参数
KM.defaultOptions = {
    zIndex : 1000,
    lang:'zh-cn'
};

KityMinder.Geometry = ( function () {
	var g = {};
	var min = Math.min,
		max = Math.max,
		abs = Math.abs;
	var own = Object.prototype.hasOwnProperty;

	g.isNumberInRange = function ( number, range ) {
		return number > range[ 0 ] && number < range[ 1 ];
	};

	g.getDistance = function ( p1, p2 ) {
		return kity.Vector.fromPoints( p1, p2 ).length();
	};

	function wrapBox( box ) {
		box.width = box.right - box.left;
		box.height = box.bottom - box.top;
		box.x = box.left;
		box.y = box.top;
		return box;
	}

	g.getBox = function ( p1, p2 ) {
		return wrapBox( {
			left: min( p1.x, p2.x ),
			right: max( p1.x, p2.x ),
			top: min( p1.y, p2.y ),
			bottom: max( p1.y, p2.y )
		} );
	};

	g.mergeBox = function ( b1, b2 ) {
		return wrapBox( {
			left: min( b1.left, b2.left ),
			right: max( b1.right, b2.right ),
			top: min( b1.top, b2.top ),
			bottom: max( b1.bottom, b2.bottom )
		} );
	};

	g.getBoxRange = function ( box ) {
		return {
			x: [ box.left, box.right ],
			y: [ box.top, box.bottom ]
		};
	};

	g.getBoxVertex = function ( box ) {
		return {
			leftTop: {
				x: box.left,
				y: box.top
			},
			rightTop: {
				x: box.right,
				y: box.top
			},
			leftBottom: {
				x: box.left,
				y: box.bottom
			},
			rightBottom: {
				x: box.right,
				y: box.bottom
			}
		};
	};

	g.isPointInsideBox = function ( p, b ) {
		var ranges = g.getBoxRange( b );
		return g.isNumberInRange( p.x, ranges.x ) && g.isNumberInRange( p.y, ranges.y );
	};

	g.isBoxIntersect = function ( b1, b2 ) {
		var minx = max(b1.left, b2.left),
			miny = max(b1.top, b2.top),
			maxx = min(b1.right, b2.right),
			maxy = min(b1.bottom, b2.bottom);
		return minx < maxx && miny < maxy;
	};

	g.snapToSharp = function ( unknown ) {
		if ( utils.isNumber( unknown ) ) {
			return ( unknown | 0 ) + 0.5;
		}
		if ( utils.isArray( unknown ) ) {
			return unknown.map( g.snapToSharp );
		}
		[ 'x', 'y', 'left', 'top', 'right', 'bottom' ].forEach( function ( n ) {
			if ( own.call( unknown, n ) ) {
				unknown[ n ] = g.snapToSharp( unknown[ n ] );
			}
		} );
		return unknown;
	};

	g.expandBox = function( box, sizeX, sizeY ) {
		if(sizeY === undefined) {
			sizeY = sizeX;
		}
		return wrapBox( {
			left: box.left - sizeX,
			top: box.top - sizeY,
			right: box.right + sizeX,
			bottom: box.bottom + sizeY
		} );
	};

	return g;
} )();

KityMinder.registerModule( "HistoryModule", function () {

    var km = this;

    var Scene = kity.createClass( 'Scene', {
        constructor: function ( root ) {
            this.data = root.clone();
        },
        getData: function () {
            return this.data;
        },
        cloneData: function () {
            return this.getData().clone();
        },
        equals: function ( scene ) {
            return this.getData().equals( scene.getData() )
        }
    } );
    var HistoryManager = kity.createClass( 'HistoryManager', {
        constructor: function ( km ) {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
            this.km = km;
        },
        undo: function () {
            if ( this.hasUndo ) {
                if ( !this.list[ this.index - 1 ] && this.list.length == 1 ) {
                    this.reset();
                    return;
                }
                while ( this.list[ this.index ].equals( this.list[ this.index - 1 ] ) ) {
                    this.index--;
                    if ( this.index == 0 ) {
                        return this.restore( 0 );
                    }
                }
                this.restore( --this.index );
            }
        },
        redo: function () {
            if ( this.hasRedo ) {
                while ( this.list[ this.index ].equals( this.list[ this.index + 1 ] ) ) {
                    this.index++;
                    if ( this.index == this.list.length - 1 ) {
                        return this.restore( this.index );
                    }
                }
                this.restore( ++this.index );
            }
        },
        restore: function () {
            var scene = this.list[ this.index ];

            this.km.setRoot( scene.cloneData() );
            this.km.removeAllSelectedNodes();
            this.km.initStyle();

            this.update();
            this.km.fire('restoreScene');
            this.km.fire('contentChange');
        },
        getScene: function () {
            return new Scene( this.km.getRoot() )
        },
        saveScene: function () {
            var currentScene = this.getScene();
            var lastScene = this.list[ this.index ];
            if ( lastScene && lastScene.equals( currentScene ) ) {
                return
            }
            this.list = this.list.slice( 0, this.index + 1 );
            this.list.push( currentScene );
            //如果大于最大数量了，就把最前的剔除
            if ( this.list.length > this.km.getOptions( 'maxUndoCount' ) ) {
                this.list.shift();
            }
            this.index = this.list.length - 1;
            //跟新undo/redo状态
            this.update();
        },
        update: function () {
            this.hasRedo = !! this.list[ this.index + 1 ];
            this.hasUndo = !! this.list[ this.index - 1 ];
        },
        reset: function () {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
        }
    } );
    //为km实例添加history管理
    this.historyManager = new HistoryManager( this );

    var keys = {
            /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1,/*Command*/91:1,
            37:1, 38:1, 39:1, 40:1
        },
        keycont = 0,
        lastKeyCode,
        saveSceneTimer;
    return {
        defaultOptions: {
            maxUndoCount: 20,
            maxInputCount:20
        },
        "commands": {
            "undo": kity.createClass( "UndoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.undo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasUndo ? 0 : -1;
                },

                isNeedUndo: function () {
                    return false;
                }
            } ),
            "redo": kity.createClass( "RedoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.redo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasRedo ? 0 : -1;
                },
                isNeedUndo: function () {
                    return false;
                }
            } )
        },
        addShortcutKeys: {
            "Undo": "ctrl+90", //undo
            "Redo": "ctrl+89" //redo
        },
        "events": {
            "saveScene": function ( e ) {
                this.historyManager.saveScene();
            },
            "renderNode":function(e){
                var node = e.node;

                if(node.isHighlight()){
                    km.select(node);
                }
            },
            "keydown":function(e){
                var orgEvt = e.originEvent;
                var keyCode = orgEvt.keyCode || orgEvt.which;
                if (!keys[keyCode] && !orgEvt.ctrlKey && !orgEvt.metaKey && !orgEvt.shiftKey && !orgEvt.altKey) {


                    if (km.historyManager.list.length == 0) {
                        km.historyManager.saveScene();
                    }
                    clearTimeout(saveSceneTimer);

                    saveSceneTimer = setTimeout(function(){
                        km.historyManager.saveScene();
                    },200);

                    lastKeyCode = keyCode;
                    keycont++;
                    if (keycont >= km.getOptions('maxInputCount') ) {
                        km.historyManager.saveScene()
                    }
                }
            }
        }
    };
} );

KityMinder.registerModule( "IconModule", function () {
	var renderPriorityIcon = function ( node, val ) {
		var colors = [ "", "red", "blue", "green", "orange", "purple" ];
		var _bg = new kity.Rect().fill( colors[ val ] ).setRadius( 3 ).setWidth( 20 ).setHeight( 20 );
		var _number = new kity.Text().setContent( val ).fill( "white" ).setSize( 12 );
		var _rc = new kity.Group();
		_rc.addShapes( [ _bg, _number ] );
		node.getIconRc().addShape( _rc );
		_number.setTransform( new kity.Matrix().translate( 6, 15 ) );
	};
	var renderProgressIcon = function ( node, val, left ) {
		var _rc = new kity.Group();
		var _bg = new kity.Circle().setRadius( 8 ).fill( "white" ).stroke( new kity.Pen( "blue", 2 ) );
		var _percent, d;
		if ( val < 5 ) {
			_percent = new kity.Path();
			d = _percent.getDrawer();
			d.moveTo( 0, 0 ).lineTo( 6, 0 );
		} else _percent = new kity.Group();
		_rc.addShapes( [ _bg, _percent ] );
		node.getIconRc().addShape( _rc );
		_rc.setTransform( new kity.Matrix().translate( left, 10 ) );
		_percent.setTransform( 10, 10 );
		switch ( val ) {
		case 1:
			break;
		case 2:
			d.carcTo( 6, 0, -6 );
			break;
		case 3:
			d.carcTo( 6, -6, 0 );
			break;
		case 4:
			d.carcTo( 6, 0, 6, 1, 0 );
			break;
		case 5:
			_percent.addShape( new kity.Circle().setRadius( 6 ).fill( "blue" ) );
			break;
		}
		if ( val < 5 ) d.close();
		_percent.fill( "blue" );
	};
	var ChangeIconCommand = kity.createClass( "AddIconCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, iconType, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( iconType, value );
					km.updateLayout( nodes[ i ] );
				}
			}
		};
	} )() );
	var RemoveIconCommand = kity.createClass( "RemoveIconCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, iconType ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( iconType, null );
					km.updateLayout( nodes[ i ] );
				}
			}
		};
	} )() );
	return {
		"commands": {
			"changeicon": ChangeIconCommand,
			"removeicon": RemoveIconCommand
		},
		"events": {
			"RenderNode": function ( e ) {
				var node = e.node;
				var iconRc = node.getIconRc();
				var PriorityIconVal = node.getData( "PriorityIcon" );
				var ProgressIconVal = node.getData( "ProgressIcon" );
				//依次排布图标、文字
				iconRc.setTransform( new kity.Matrix().translate( 0, -20 ) );
				iconRc.clear();
				var PriorityIconWidth = 0;
				if ( PriorityIconVal ) {
					renderPriorityIcon( node, PriorityIconVal );
					PriorityIconWidth = 22;
				}
				if ( ProgressIconVal ) {
					renderProgressIcon( node, ProgressIconVal, PriorityIconWidth + 10 );
				}
				var iconWidth = iconRc.getWidth();
				var textShape = node.getTextShape();
				if ( iconWidth ) textShape.setTransform( new kity.Matrix().translate( iconWidth + 5, 0 ) );
			}
		}
	};
} );

KityMinder.registerModule( "LayoutModule", function () {
	kity.extendClass( Minder, {
		addLayoutStyle: function ( name, style ) {
			if ( !this._layoutStyles ) this._layoutStyles = {};
			this._layoutStyles[ name ] = style;
		},
		getLayoutStyle: function ( name ) {
			return this._layoutStyles[ name ];
		},
		getLayoutStyleItems: function () {
			return this._layoutStyles;
		},
		getCurrentStyle: function () {
			var _root = this.getRoot();
			return _root.getData( "currentstyle" );
		},
		setCurrentStyle: function ( name ) {
			var _root = this.getRoot();
			_root.setData( "currentstyle", name );
			return name;
		},
		highlightNode: function ( node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).highlightNode.call( this, node );
		},
		initStyle: function () {
			var curStyle = this.getCurrentStyle();
			this._rc.remove();
			this._rc = new kity.Group();
			this._paper.addShape( this._rc );

			var _root = this.getRoot();
			_root.preTraverse( function ( n ) {
				n.clearLayout();
			} );
			this.getLayoutStyle( curStyle ).initStyle.call( this );
		},
		appendChildNode: function ( parent, node, index ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).appendChildNode.call( this, parent, node, index );
		},
		appendSiblingNode: function ( sibling, node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).appendSiblingNode.call( this, sibling, node );
		},
		removeNode: function ( nodes ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).removeNode.call( this, nodes );
		},
		updateLayout: function ( node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).updateLayout.call( this, node );
		},
		expandNode: function ( ico ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).expandNode.call( this, ico );
		}
	} );
	kity.extendClass( MinderNode, {
		setLayout: function ( k, v ) {
			if ( this._layout === undefined ) {
				this._layout = {};
			}
			var _pros = this.getLayout();
			Utils.extend( _pros, {
				k: v
			} );
			this._layout = _pros;
		},
		getLayout: function ( k ) {
			if ( k === undefined ) {
				return this._layout;
			}
			return this._layout[ k ];
		},
		clearLayout: function () {
			this._layout = {};
		}
	} );
	var switchLayout = function ( km, style ) {
		var _root = km.getRoot();
		_root.preTraverse( function ( n ) {
			n.setPoint();
			n.getBgRc().clear();
		} );
		km.setCurrentStyle( style );
		km.initStyle();
		return style;
	};
	var SwitchLayoutCommand = kity.createClass( "SwitchLayoutCommand", ( function () {
		return {
			base: Command,
			execute: switchLayout
		};
	} )() );
	var AppendChildNodeCommand = kity.createClass( "AppendChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				var parent = km.getSelectedNode();
				if ( !parent ) {
					return false;
				}
				km.appendChildNode( parent, node );
				km.select( node, true );
				return node;
			}
		};
	} )() );
	var AppendSiblingNodeCommand = kity.createClass( "AppendSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				var selectedNode = km.getSelectedNode();
				if ( !selectedNode ) {
					return false;
				}
				if ( selectedNode.isRoot() ) {
					node.setType( "main" );
					km.appendChildNode( selectedNode, node );
				} else {
					node.setType( "sub" );
					km.appendSiblingNode( selectedNode, node );
				}
				km.select( node, true );
				return node;
			}
		};
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				var selectedNodes = km.getSelectedNodes();
				var _buffer = [];
				for ( var i = 0; i < selectedNodes.length; i++ ) {
					_buffer.push( selectedNodes[ i ] );
				}
				do {
					var parent = _buffer[ 0 ].getParent();
					if ( parent && _buffer.indexOf( parent ) === -1 ) _buffer.push( parent );
					_buffer.shift();
				} while ( _buffer.length !== 1 );
				km.removeNode( selectedNodes );
				km.select( _buffer[ 0 ] );
			}
		};
	} )() );

	return {
		"commands": {
			"appendchildnode": AppendChildNodeCommand,
			"appendsiblingnode": AppendSiblingNodeCommand,
			"removenode": RemoveNodeCommand,
			"switchlayout": SwitchLayoutCommand
		},
		"events": {
			"ready": function () {
				this.setDefaultOptions( 'layoutstyle', this.getLayoutStyleItems() );
				switchLayout( this, this.getOptions( 'defaultlayoutstyle' ) );
			},
			"click": function ( e ) {
				var ico = e.kityEvent.targetShape && e.kityEvent.targetShape.container;
				if ( ico && ico.class === "shicon" ) {
					this.expandNode( ico );
				}
			},
			"resize": function ( e ) {
				clearTimeout( this._lastStyleResetTimeout );
				this._lastStyleResetTimeout = setTimeout( function () {
					this.updateLayout( this.getRoot() );
				}.bind( this ), 100 );
			},
			"import": function ( e ) {
				this.initStyle( this.getRoot() );
			}
		},
		"defaultOptions": {
			"defaultlayoutstyle": "default"
		}
	};
} );

KityMinder.registerModule( "LayoutDefault", function () {
	var _target = this.getRenderTarget();

	function getMinderSize() {
		return {
			width: _target.clientWidth,
			height: _target.clientHeight
		};
	}
	var minder = this;
	//收缩-展开子树的节点
	var ShIcon = kity.createClass( "DefaultshIcon", ( function () {
		return {
			constructor: function ( node ) {
				this._show = false;
				this._node = node;
				var iconShape = this.shape = new kity.Group();
				iconShape.class = "shicon";
				iconShape.icon = this;
				var circle = this._circle = new kity.Circle().fill( "white" ).stroke( "gray" ).setRadius( 5 );
				var plus = this._plus = new kity.Path();
				plus.getDrawer()
					.moveTo( -3, 0 )
					.lineTo( 3, 0 )
					.moveTo( 0, -3 )
					.lineTo( 0, 3 );
				plus.stroke( "gray" );
				var dec = this._dec = new kity.Path();
				dec.getDrawer()
					.moveTo( -3, 0 )
					.lineTo( 3, 0 );
				dec.stroke( "gray" );
				minder.getRenderContainer().addShape( iconShape );
				iconShape.addShapes( [ circle, plus, dec ] );
				this.update();
				this.switchState();
			},
			switchState: function () {
				if ( !this._show ) {
					this._plus.setOpacity( 0 );
					this._dec.setOpacity( 1 );
					this._show = true;
				} else {
					this._plus.setOpacity( 1 );
					this._dec.setOpacity( 0 );
					this._show = false;
				}
				return this._show;
			},
			update: function () {
				var node = this._node;
				var Layout = node.getLayout();
				var nodeShape = node.getRenderContainer();
				var nodeX, nodeY = ( node.getType() === "main" ? Layout.y : ( Layout.y + nodeShape.getHeight() / 2 - 5 ) );
				if ( Layout.appendside === "left" ) {
					nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x - 6;
				} else {
					nodeX = nodeShape.getRenderBox().closurePoints[ 0 ].x + 6;
				}
				this.shape.setTransform( new kity.Matrix().translate( nodeX, nodeY ) );
			},
			remove: function () {
				this.shape.remove();
			}
		};
	} )() );
	//求并集
	var uSet = function ( a, b ) {
		for ( var i = 0; i < a.length; i++ ) {
			var idx = b.indexOf( a[ i ] );
			if ( idx !== -1 ) {
				b.splice( idx, 1 );
			}
		}
		return a.concat( b );
	};
	//样式的配置（包括颜色、字号等）
	var nodeStyles = {
		"root": {
			color: '#430',
			fill: '#e9df98',
			fontSize: 24,
			padding: [ 15.5, 25.5, 15.5, 25.5 ],
			margin: [ 0, 0, 0, 0 ],
			radius: 30,
			highlight: 'rgb(254, 219, 0)'
		},
		"main": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			fill: '#A4c5c0',
			color: "#333",
			padding: [ 6.5, 20, 6.5, 20 ],
			fontSize: 16,
			margin: [ 0, 10, 30, 50 ],
			radius: 10,
			highlight: 'rgb(254, 219, 0)'
		},
		"sub": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			color: "white",
			fontSize: 12,
			margin: [ 0, 10, 20, 6 ],
			padding: [ 5, 10, 5.5, 10 ],
			highlight: 'rgb(254, 219, 0)'
		}
	};
	//更新背景
	var updateBg = function ( node ) {
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var Layout = node.getLayout();
		switch ( node.getType() ) {
		case "root":
		case "main":
			var bg = node.getBgRc().clear();
			bg.addShape( Layout.bgShadow = new kity.Rect() );
			bg.addShape( Layout.bgRect = new kity.Rect() );
			Layout.bgRect.fill( nodeStyle.fill ).setRadius( nodeStyle.radius );
			Layout.bgShadow.fill( 'black' ).setOpacity( 0.2 ).setRadius( nodeStyle.radius ).translate( 3, 5 );
			break;
		case "sub":
			var underline = Layout.underline = new kity.Path();
			var highlightshape = Layout.highlightshape = new kity.Rect().setRadius( 4 );
			node.getBgRc().clear().addShapes( [ highlightshape, underline ] );
			break;
		default:
			break;
		}
	};
	//初始化样式
	var initLayout = function ( node ) {
		var Layout = node.getLayout();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var txtShape = node.getTextShape();
		txtShape.fill( nodeStyle.color ).setSize( nodeStyle.fontSize ).setY( -3 );
		if ( nodeType === "root" ) {
			Layout.leftList = [];
			Layout.rightList = [];
			Layout.leftHeight = 0;
			Layout.rightHeight = 0;
		}
	};
	//根据内容调整节点尺寸
	var updateShapeByCont = function ( node ) {
		var contRc = node.getContRc();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var _contRCWidth = contRc.getWidth();
		var _contRCHeight = contRc.getHeight();
		var Layout = node.getLayout();
		switch ( nodeType ) {
		case "root":
		case "main":
			var width = _contRCWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ],
				height = _contRCHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ];
			Layout.bgRect.setWidth( width ).setHeight( height );
			Layout.bgShadow.setWidth( width ).setHeight( height );
			break;
		case "sub":
			var _contWidth = contRc.getWidth();
			var _contHeight = contRc.getHeight();
			Layout.underline.getDrawer()
				.clear()
				.moveTo( 0, _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] )
				.lineTo( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ], _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] );
			Layout.underline.stroke( nodeStyle.stroke );
			Layout.highlightshape
				.setWidth( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ] )
				.setHeight( _contHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
			break;
		default:
			break;
		}
		contRc.setTransform( new kity.Matrix().translate( nodeStyle.padding[ 3 ], nodeStyle.padding[ 0 ] + node.getTextShape().getHeight() ) );
	};
	//计算节点在垂直方向的位置
	var updateLayoutVertical = function ( node, parent, action ) {
		var root = minder.getRoot();
		var effectSet = [ node ];
		if ( action === "remove" ) {
			effectSet = [];
		}
		var Layout = node.getLayout();
		var nodeShape = node.getRenderContainer();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[ nodeType ];
		var appendside = Layout.appendside;
		var countBranchHeight = function ( node, side ) {
			var nodeStyle = nodeStyles[ node.getType() ];
			var selfHeight = node.getRenderContainer().getHeight() + nodeStyle.margin[ 0 ] + nodeStyle.margin[ 2 ];
			var childHeight = ( function () {
				var sum = 0;
				var children;
				if ( !side ) {
					children = node.getChildren();
				} else {
					children = node.getLayout()[ side + "List" ];
				}
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getLayout();
					if ( children[ i ].getRenderContainer().getHeight() !== 0 )
						sum += childLayout.branchheight;
				}
				return sum;
			} )();
			if ( side ) {
				return childHeight;
			} else {
				return ( selfHeight > childHeight ? selfHeight : childHeight );
			}
		};
		if ( nodeType === "root" ) {
			Layout.y = getMinderSize().height / 2;
			effectSet.push( node );
		} else {
			if ( action === "append" || action === "contract" ) {
				Layout.branchheight = node.getRenderContainer().getHeight() + nodeStyle.margin[ 0 ] + nodeStyle.margin[ 2 ];
			} else if ( action === "change" ) { //展开
				Layout.branchheight = countBranchHeight( node );
			}
			var parentLayout = parent.getLayout();
			var parentShape = parent.getRenderContainer();
			var prt = node.getParent() || parent;
			//自底向上更新祖先元素的branchheight值
			while ( prt ) {
				var prtLayout = prt.getLayout();
				if ( prt.getType() === "root" ) {
					prtLayout[ appendside + "Height" ] = countBranchHeight( prt, appendside );
				} else {
					prtLayout.branchheight = countBranchHeight( prt );
				}
				prt = prt.getParent();
			}
			//自顶向下更新受影响一侧的y值
			var sideList = root.getLayout()[ appendside + "List" ];
			var _buffer = [ root ];
			while ( _buffer.length > 0 ) {
				var _buffer0Layout = _buffer[ 0 ].getLayout();
				var children = _buffer0Layout[ appendside + "List" ] || _buffer[ 0 ].getChildren();
				_buffer = _buffer.concat( children );
				var sY = _buffer0Layout.y - ( _buffer0Layout[ appendside + "Height" ] || _buffer0Layout.branchheight ) / 2;
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getLayout();
					childLayout.y = sY + childLayout.branchheight / 2;
					sY += childLayout.branchheight;
				}
				effectSet.push( _buffer[ 0 ] );
				_buffer.shift();
			}
		}
		return effectSet;
	};
	//计算节点在水平方向的位置
	var updateLayoutHorizon = function ( node ) {
		var nodeType = node.getType();
		var parent = node.getParent();
		var effectSet = [ node ];
		var Layout = node.getLayout();
		var _buffer = [ node ];
		while ( _buffer.length !== 0 ) {
			var prt = _buffer[ 0 ].getParent();
			_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
			if ( !prt ) {
				Layout.x = getMinderSize().width / 2;
				_buffer.shift();
				continue;
			}
			var parentLayout = prt.getLayout();
			var parentWidth = prt.getRenderContainer().getWidth();
			var parentStyle = nodeStyles[ prt.getType() ];
			var childLayout = _buffer[ 0 ].getLayout();
			var childStyle = nodeStyles[ _buffer[ 0 ].getType() ];
			if ( parentLayout.align === "center" ) {
				parentWidth = parentWidth / 2;
			}
			if ( childLayout.appendside === "left" ) {
				childLayout.x = parentLayout.x - parentWidth - parentStyle.margin[ 1 ] - childStyle.margin[ 3 ];
			} else {
				childLayout.x = parentLayout.x + parentWidth + parentStyle.margin[ 1 ] + childStyle.margin[ 3 ];
			}
			effectSet.push( _buffer[ 0 ] );
			_buffer.shift();
		}
		return effectSet;
	};
	var translateNode = function ( node ) {
		var Layout = node.getLayout();
		var nodeShape = node.getRenderContainer();
		var align = Layout.align;
		var _rectHeight = nodeShape.getHeight();
		var _rectWidth = nodeShape.getWidth();
		switch ( align ) {
		case "right":
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x - _rectWidth, Layout.y - _rectHeight / 2 ) );
			break;
		case "center":
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x - _rectWidth / 2, Layout.y - _rectHeight / 2 ) );
			break;
		default:
			nodeShape.setTransform( new kity.Matrix().translate( Layout.x, Layout.y - _rectHeight / 2 ) );
			break;
		}
		node.setPoint( Layout.x, Layout.y );
	};
	var updateConnectAndshIcon = function ( node ) {
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var nodeStyle = nodeStyles[ node.getType() ];
		var connect;
		//更新连线
		if ( nodeType === "main" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Group();
				var bezier = Layout.connect.bezier = new kity.Bezier();
				var circle = Layout.connect.circle = new kity.Circle();
				connect.addShapes( [ bezier, circle ] );
				minder.getRenderContainer().addShape( connect );
				minder.getRoot().getRenderContainer().bringTop();
			}
			var parent = minder.getRoot();
			var rootX = parent.getLayout().x;
			var rootY = parent.getLayout().y;
			connect = Layout.connect;
			var nodeShape = node.getRenderContainer();
			var nodeClosurePoints = nodeShape.getRenderBox().closurePoints;
			var sPos;
			var endPos;
			if ( Layout.appendside === "left" ) {
				sPos = new kity.BezierPoint( rootX - 30, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 2 ].x, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
			} else {
				sPos = new kity.BezierPoint( rootX + 30, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 3 ].x, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
			}
			var sPosV = sPos.getVertex();
			var endPosV = endPos.getVertex();
			sPos.setVertex( rootX, rootY );
			connect.bezier.setPoints( [ sPos, endPos ] ).stroke( nodeStyle.stroke );
			connect.circle.setCenter( endPosV.x + ( Layout.appendside === "left" ? 3 : -3 ), endPosV.y ).fill( "white" ).stroke( "gray" ).setRadius( 3 );
		} else if ( nodeType === "sub" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Path();
				minder.getRenderContainer().addShape( connect );
			}
			connect = Layout.connect;
			var parentShape = node.getParent().getRenderContainer();
			var parentBox = parentShape.getRenderBox();
			var parentLayout = node.getParent().getLayout();
			var parentStyle = nodeStyles[ node.getParent().getType() ];
			var Shape = node.getRenderContainer();
			var sX, sY = parentLayout.y;
			var nodeX, nodeY = Shape.getRenderBox().closurePoints[ 1 ].y;
			if ( Layout.appendside === "left" ) {
				sX = parentBox.closurePoints[ 1 ].x - parentStyle.margin[ 1 ];
				nodeX = Shape.getRenderBox().closurePoints[ 0 ].x;
				connect.getDrawer()
					.clear()
					.moveTo( sX, sY )
					.lineTo( sX, nodeY > sY ? ( nodeY - nodeStyle.margin[ 3 ] ) : ( nodeY + nodeStyle.margin[ 3 ] ) );
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY, 0, 1 );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY );
				connect.stroke( nodeStyle.stroke );
			} else {
				sX = parentBox.closurePoints[ 0 ].x + parentStyle.margin[ 1 ];
				nodeX = Shape.getRenderBox().closurePoints[ 1 ].x + 1;
				connect.getDrawer()
					.clear()
					.moveTo( sX, sY )
					.lineTo( sX, nodeY > sY ? ( nodeY - nodeStyle.margin[ 3 ] ) : ( nodeY + nodeStyle.margin[ 3 ] ) );
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], nodeX, nodeY, 0, 1 );
				connect.stroke( nodeStyle.stroke );
			}
		}
		//更新收放icon
		if ( nodeType !== "root" ) {
			if ( !Layout.shicon ) {
				Layout.shicon = new ShIcon( node );
			}
			Layout.shicon.update();
		}
	};
	var _style = {
		highlightNode: function ( node ) {
			var highlight = node.isHighlight();
			var nodeType = node.getType();
			var nodeStyle = nodeStyles[ nodeType ];
			var Layout = node.getLayout();
			switch ( nodeType ) {
			case "root":
			case "main":
				if ( highlight ) {
					Layout.bgRect.fill( nodeStyle.highlight );
				} else {
					Layout.bgRect.fill( nodeStyle.fill );
				}
				break;
			case "sub":
				if ( highlight ) {
					Layout.highlightshape.fill( nodeStyle.highlight ).setOpacity( 1 );
					node.getTextShape().fill( 'black' );
				} else {
					Layout.highlightshape.setOpacity( 0 );
					node.getTextShape().fill( 'white' );
				}
				break;
			default:
				break;
			}
		},
		updateLayout: function ( node ) {
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: node
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
				node: node
			}, false ) );

			updateShapeByCont( node );
			var set1 = updateLayoutHorizon( node );
			var set2 = updateLayoutVertical( node, node.getParent(), "change" );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
		},
		initStyle: function () {
			var _root = minder.getRoot();
			minder.handelNodeInsert( _root );
			//设置root的align
			_root.getLayout().align = "center";
			updateBg( _root );
			initLayout( _root );
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: _root
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
				node: _root
			}, false ) );
			updateShapeByCont( _root );
			updateLayoutHorizon( _root );
			updateLayoutVertical( _root );
			translateNode( _root );
			var _buffer = [ _root ];
			var _cleanbuffer = [];
			//打散结构
			while ( _buffer.length !== 0 ) {
				var children = _buffer[ 0 ].getChildren();
				_buffer = _buffer.concat( children );
				for ( var i = 0; i < children.length; i++ ) {
					children[ i ].getLayout().parent = _buffer[ 0 ];
				}
				_buffer[ 0 ].clearChildren();
				if ( _buffer[ 0 ] !== _root ) _cleanbuffer.push( _buffer[ 0 ] );
				_buffer.shift();
			}
			//重组结构
			for ( var j = 0; j < _cleanbuffer.length; j++ ) {
				this.appendChildNode( _cleanbuffer[ j ].getLayout().parent, _cleanbuffer[ j ] );
			}
		},
		appendChildNode: function ( parent, node, sibling ) {
			minder.handelNodeInsert( node );
			node.clearLayout();
			var Layout = node.getLayout();
			var parentLayout = parent.getLayout();
			if ( sibling ) {
				var siblingLayout = sibling.getLayout();
				Layout.appendside = siblingLayout.appendside;
				Layout.align = siblingLayout.align;
				parent.insertChild( node, sibling.getIndex() + 1 );
				if ( parent.getType() === "root" ) {
					var sideList = parentLayout[ Layout.appendside + "List" ];
					var idx = sideList.indexOf( sibling );
					sideList.splice( idx + 1, 0, node );
				}
			} else {
				if ( parent.getType() !== "root" ) {
					var prtLayout = parent.getLayout();
					Layout.appendside = prtLayout.appendside;
					Layout.align = prtLayout.align;
					parent.appendChild( node );
				} else {
					var nodeP = node.getPoint();
					if ( nodeP && nodeP.x && nodeP.y ) {
						if ( nodeP.x > parentLayout.x ) {
							Layout.appendside = "right";
							Layout.align = "left";
						} else {
							Layout.appendside = "left";
							Layout.align = "right";
						}
					} else {
						if ( parentLayout.rightList.length > 1 && parentLayout.rightList.length > parentLayout.leftList.length ) {
							Layout.appendside = "left";
							Layout.align = "right";
						} else {
							Layout.appendside = "right";
							Layout.align = "left";
						}
					}
					var sideList1 = parentLayout[ Layout.appendside + "List" ];
					sideList1.push( node );
					var idx1;
					if ( Layout.appendside === "right" ) {
						idx1 = sideList1.length;
					} else {
						idx1 = parent.getChildren().length;
					}
					parent.insertChild( node, idx1 );
				}
			}
			//设置分支类型
			if ( parent.getType() === "root" ) {
				node.setType( "main" );
			} else {
				node.setType( "sub" );
			}
			//计算位置等流程
			updateBg( node );
			initLayout( node );
			this._fire( new MinderEvent( "beforeRenderNode", {
				node: node
			}, false ) );
			this._fire( new MinderEvent( "RenderNode", {
				node: node
			}, false ) );
			updateShapeByCont( node );
			var set1 = updateLayoutVertical( node, parent, "append" );
			var set2 = updateLayoutHorizon( node );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
		},
		appendSiblingNode: function ( sibling, node ) {
			var parent = sibling.getParent();
			this.appendChildNode( parent, node, sibling );
		},
		removeNode: function ( nodes ) {
			while ( nodes.length !== 0 ) {
				var parent = nodes[ 0 ].getParent();
				var nodeLayout = nodes[ 0 ].getLayout();
				if ( parent.getType() === "root" ) {
					var sideList = parent.getLayout()[ nodeLayout.appendside + "List" ];
					var index = sideList.indexOf( nodes[ 0 ] );
					sideList.splice( index, 1 );
				}
				parent.removeChild( nodes[ 0 ] );
				var set = updateLayoutVertical( nodes[ 0 ], parent, "remove" );
				for ( var j = 0; j < set.length; j++ ) {
					translateNode( set[ j ] );
					updateConnectAndshIcon( set[ j ] );
				}
				var _buffer = [ nodes[ 0 ] ];
				while ( _buffer.length !== 0 ) {
					_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
					try {
						_buffer[ 0 ].getRenderContainer().remove();
						var Layout = _buffer[ 0 ].getLayout();
						Layout.connect.remove();
						Layout.shicon.remove();
					} catch ( error ) {
						console.log( "isRemoved" );
					}
					//检测当前节点是否在选中的数组中，如果在的话，从选中数组中去除
					var idx = nodes.indexOf( _buffer[ 0 ] );
					if ( idx !== -1 ) {
						nodes.splice( idx, 1 );
					}
					_buffer.shift();
				}
			}
		},
		expandNode: function ( ico ) {
			var isExpand = ico.icon.switchState();
			var node = ico.icon._node;
			var _buffer = node.getChildren();
			var _cleanbuffer = [];

			while ( _buffer.length !== 0 ) {
				var Layout = _buffer[ 0 ].getLayout();
				if ( isExpand ) {
					var parent = _buffer[ 0 ].getParent();
					Layout.parent = parent;
					_cleanbuffer.push( _buffer[ 0 ] );
					//minder.appendChildNode( parent, _buffer[ 0 ] );
					Layout.connect = null;
					Layout.shicon = null;
				} else {
					_buffer[ 0 ].getRenderContainer().remove();
					Layout.connect.remove();
					Layout.shicon.remove();
				}
				_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
				_buffer.shift();
			}
			if ( isExpand ) {
				node.clearChildren();
				for ( var j = 0; j < _cleanbuffer.length; j++ ) {
					_cleanbuffer[ j ].clearChildren();
					minder.appendChildNode( _cleanbuffer[ j ].getLayout().parent, _cleanbuffer[ j ] );
				}
			}
			var set = [];
			if ( !isExpand ) set = updateLayoutVertical( node, node.getParent(), "contract" );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
		}
	};
	this.addLayoutStyle( "default", _style );
	return {};
} );

KityMinder.registerModule( "LayoutBottom", function () {
	var minder = this;
	var ShIcon = kity.createClass( "DefaultshIcon", ( function () {
		return {
			constructor: function ( node ) {
				this._show = false;
				this._node = node;
				var iconShape = this.shape = new kity.Group();
				iconShape.class = "shicon";
				iconShape.icon = this;
				var rect = this._rect = new kity.Rect().fill( "white" ).stroke( "gray" ).setWidth( 10 ).setHeight( 10 ).setRadius( 2 );
				var plus = this._plus = new kity.Path();
				plus.getDrawer()
					.moveTo( 2, 5 )
					.lineTo( 8, 5 )
					.moveTo( 5, 2 )
					.lineTo( 5, 8 );
				plus.stroke( "gray" );
				var dec = this._dec = new kity.Path();
				dec.getDrawer()
					.moveTo( 2, 5 )
					.lineTo( 8, 5 );
				dec.stroke( "gray" );
				minder.getRenderContainer().addShape( iconShape );
				iconShape.addShapes( [ rect, plus, dec ] );
				node.setData( "shicon", this );
				this.update();
				this.switchState();
			},
			switchState: function () {
				if ( !this._show ) {
					this._plus.setOpacity( 0 );
					this._dec.setOpacity( 1 );
					this._show = true;
				} else {
					this._plus.setOpacity( 1 );
					this._dec.setOpacity( 0 );
					this._show = false;
				}
				return this._show;
			},
			update: function () {
				var node = this._node;
				var Layout = node.getData( "layout" );
				var nodeShape = node.getRenderContainer();
				var nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x + 5;
				var nodeY = nodeShape.getRenderBox().closurePoints[ 1 ].y + 1;
				this.shape.setTransform( new kity.Matrix().translate( nodeX, nodeY ) );
			},
			remove: function () {
				this.shape.remove();
			}
		};
	} )() );
	//主分支
	var MainBranch = kity.createClass( "DefaultMainBranch", ( function () {
		return {
			constructor: function ( node ) {
				this._node = node;
				var bgRc = node.getBgRc();
				var contRc = node.getContRc();
				var txt = this._txt = new kity.Text();
				var rect = this._rect = new kity.Rect();
				var shicon = this._shicon = new ShIcon( node );
				bgRc.addShape( rect );
				var connect = this._connect = new kity.Group();
				var path = connect.path = new kity.Path();
				var circle = connect.circle = new kity.Circle();
				connect.addShapes( [ path, circle ] );
				minder.getRenderContainer().addShape( connect );
				var Layout = {
					radius: 0,
					fill: "white",
					color: "black",
					padding: [ 5.5, 20, 5.5, 20 ],
					fontSize: 20,
					margin: [ 10, 10, 30, 50 ],
					shape: this,
					align: ( "leftright" ).replace( node.getData( "layout" ).appendside, "" ),
					appendside: node.getData( "layout" ).appendside
				};
				node.setData( "layout", Layout );
				contRc.setTransform( new kity.Matrix().translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 15 ) );
				this.update();
			},
			update: function () {
				var rect = this._rect;
				var node = this._node;
				var contRc = node.getContRc();
				var txt = node.getTextShape();
				var Layout = node.getData( "layout" );
				txt.setContent( node.getData( "text" ) ).fill( Layout.color );
				var _contWidth = contRc.getWidth();
				var _contHeight = contRc.getHeight();
				var _rectWidth = _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ];
				var _rectHeight = _contHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ];
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( node.getData( "highlight" ) ? "chocolate" : Layout.fill ).setRadius( Layout.radius );
				this.updateConnect();
				this.updateShIcon();
			},
			updateConnect: function () {
				var node = this._node;
				var Layout = node.getData( "layout" );
				if ( Layout.x && Layout.y ) {
					var connect = this._connect;
					connect.circle.setCenter( Layout.x + 10, Layout.y - 3 ).fill( "white" ).stroke( "gray" ).setRadius( 2 );
					var parent = node.getParent();
					var parentLayout = parent.getData( "layout" );
					var sX = parentLayout.x + 10.5,
						pY = parentLayout.y + parent.getRenderContainer().getHeight() + 0.5,
						sY = parentLayout.y + parent.getRenderContainer().getHeight() + parentLayout.margin[ 2 ] + 0.5;
					connect.path.getDrawer()
						.clear()
						.moveTo( sX, pY )
						.lineTo( sX, sY )
						.lineTo( Layout.x + 10.5, sY )
						.lineTo( Layout.x + 10.5, Layout.y );
					connect.path.stroke( "white" );
				}

			},
			updateShIcon: function () {
				this._shicon.update();
			},
			clear: function () {
				this._node.getRenderContainer().clear();
				this._connect.remove();
				this._shicon.remove();
			}
		};
	} )() );
	//子分支
	var SubBranch = kity.createClass( "DefaultSubBranch", ( function () {
		return {
			constructor: function ( node ) {
				this._node = node;
				var bgRc = node.getBgRc();
				var contRc = node.getContRc();
				var underline = this._underline = new kity.Path();
				var shicon = this._shicon = new ShIcon( node );
				var highlightshape = this._highlightshape = new kity.Rect();
				bgRc.addShapes( [ highlightshape, underline ] );
				var connect = this._connect = new kity.Path();
				minder.getRenderContainer().addShape( connect );
				var Layout = {
					stroke: new kity.Pen( "white", 1 ).setLineCap( "round" ).setLineJoin( "round" ),
					color: "white",
					padding: [ 5, 10, 5.5, 10 ],
					fontSize: 12,
					margin: [ 0, 10, 20, 5 ],
					shape: this,
					align: ( "leftright" ).replace( node.getData( "layout" ).appendside, "" ),
					appendside: node.getData( "layout" ).appendside
				};
				node.setData( "layout", Layout );
				contRc.setTransform( new kity.Matrix().translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 10 ) );
				highlightshape.fill( "chocolate" ).translate( -1, 0 );
				this.update();
			},
			update: function () {
				var node = this._node;
				var contRc = node.getContRc();
				var Layout = node.getData( "layout" );
				var underline = this._underline;
				var highlightshape = this._highlightshape;
				var txt = node.getTextShape();
				txt.setContent( node.getData( "text" ) ).fill( Layout.color ).setSize( Layout.fontSize );
				var _contWidth = contRc.getWidth();
				var _contHeight = contRc.getHeight();
				var sY = Layout.padding[ 0 ] + _contHeight / 2;
				underline.getDrawer()
					.clear()
					.moveTo( 0, _contHeight + Layout.padding[ 2 ] + Layout.padding[ 0 ] )
					.lineTo( _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ], _contHeight + Layout.padding[ 2 ] + Layout.padding[ 0 ] );
				underline.stroke( Layout.stroke );
				highlightshape
					.setWidth( _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ] )
					.setHeight( _contHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ] )
					.setOpacity( node.getData( "highlight" ) ? 1 : 0 );
				this.updateConnect();
				this.updateShIcon();
			},
			updateConnect: function () {
				var node = this._node;
				var Layout = node.getData( "layout" );
				if ( Layout.x && Layout.y ) {
					var connect = this._connect;
					var parent = node.getParent();
					var parentLayout = parent.getData( "layout" );
					var sX = parentLayout.x + 10.5,
						pY = parentLayout.y + parent.getRenderContainer().getHeight() + 10.5,
						sY = Layout.y + 0.5;
					connect.getDrawer()
						.clear()
						.moveTo( sX, pY )
						.lineTo( sX, sY )
						.lineTo( Layout.x + 0.5, sY )
						.lineTo( Layout.x + 0.5, Layout.y + node.getRenderContainer().getHeight() );
					connect.stroke( "white" );
				}
			},
			updateShIcon: function () {
				this._shicon.update();
			},
			clear: function () {
				this._node.getRenderContainer().clear();
				this._connect.remove();
				this._shicon.remove();
			}
		};
	} )() );
	//根节点
	var RootShape = kity.createClass( "DefaultRootShape", ( function () {
		return {
			constructor: function ( node ) {
				var bgRc = node.getBgRc();
				var contRc = node.getContRc();
				var rect = this._rect = new kity.Rect();
				bgRc.addShape( rect );
				this._node = node;
				var Layout = {
					shape: this,
					x: 100,
					y: 50,
					align: "center",
					appendside: node.getData( "layout" ).appendside || "right",
					leftList: [],
					rightList: [],
					color: "white",
					fontSize: 20,
					fill: "#00a6d8",
					stroke: null,
					padding: [ 10.5, 10, 10.5, 10 ],
					margin: [ 0, 0, 20, 0 ]
				};
				node.setData( "layout", Layout );
				node.setData( "text", "Minder Root" );
				contRc.setTransform( new kity.Matrix().translate( Layout.padding[ 3 ], Layout.padding[ 0 ] + 15 ) );
				this.update();
			},
			update: function () {
				var rect = this._rect;
				var connect = this._connect;
				var node = this._node;
				var txt = node.getTextShape();
				var contRc = node.getContRc();
				var Layout = node.getData( "layout" );
				txt.setContent( node.getData( "text" ) ).fill( Layout.color );
				var _contWidth = contRc.getWidth();
				var _contHeight = contRc.getHeight();
				var _rectWidth = _contWidth + Layout.padding[ 1 ] + Layout.padding[ 3 ];
				var _rectHeight = _contHeight + Layout.padding[ 0 ] + Layout.padding[ 2 ];
				rect.setWidth( _rectWidth ).setHeight( _rectHeight ).fill( node.getData( "highlight" ) ? "chocolate" : Layout.fill );
			},
			clear: function () {
				this._node.getRenderContainer().clear();
			}
		};
	} )() );
	var drawNode = function ( node ) {
		var shape = node.getData( "layout" ).shape;
		shape.update();
	};
	//以某个节点为seed对整体高度进行更改计算
	var updateLayoutVertical = function ( node ) {
		var effectSet = [ node ];
		var Layout = node.getData( "layout" );
		var parent = node.getParent();
		var parentLayout = parent.getData( "layout" );
		var parentShape = parent.getRenderContainer();
		Layout.y = parentLayout.y + parentShape.getHeight() + parentLayout.margin[ 2 ] + Layout.margin[ 0 ];
		return effectSet;
	};

	//以某个节点为seed对水平方向进行调整(包括调整子树)
	var updateLayoutHorizon = function ( node ) {
		var effectSet = []; //返回受影响（即需要进行下一步translate的节点）
		var nodeLayout = node.getData( "layout" );
		var _buffer = [ minder.getRoot() ];
		var countBranchWidth = function ( node ) {
			var Layout = node.getData( "layout" );
			var marginLeft = Layout.margin[ 3 ],
				marginRight = Layout.margin[ 1 ];
			var nodewidth = node.getRenderContainer().getWidth() + marginLeft + marginRight;
			var nodeChildWidth = ( function () {
				var sum = 0;
				var children = node.getChildren();
				for ( var i = 0; i < children.length; i++ ) {
					sum += children[ i ].getData( "layout" ).branchwidth;
				}
				return sum;
			} )();
			Layout.branchwidth = ( nodewidth > nodeChildWidth ? nodewidth : nodeChildWidth );
		};
		var parent = node;
		while ( parent ) {
			countBranchWidth( parent );
			parent = parent.getParent();
		}
		while ( _buffer.length !== 0 ) {
			_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
			var bufferLayout = _buffer[ 0 ].getData( "layout" );
			var sX = bufferLayout.x;
			var children = _buffer[ 0 ].getChildren();
			for ( var i = 0; i < children.length; i++ ) {
				countBranchWidth( children[ i ] );
				var childrenLayout = children[ i ].getData( "layout" );
				childrenLayout.x = sX;
				sX += childrenLayout.branchwidth;
			}
			effectSet.push( _buffer[ 0 ] );
			_buffer.shift();
		}
		return effectSet;
	};
	var translateNode = function ( node ) {
		var Layout = node.getData( "layout" );
		var nodeShape = node.getRenderContainer();
		nodeShape.setTransform( new kity.Matrix().translate( Layout.x, Layout.y ) );
		if ( Layout.shape ) {
			if ( Layout.shape.updateConnect ) Layout.shape.updateConnect();
			if ( Layout.shape.updateShIcon ) Layout.shape.updateShIcon();
		}
	};
	//求并集
	var uSet = function ( a, b ) {
		for ( var i = 0; i < a.length; i++ ) {
			var idx = b.indexOf( a[ i ] );
			if ( idx !== -1 ) {
				b.splice( idx, 1 );
			}
		}
		return a.concat( b );
	};
	var _style = {
		renderNode: function ( node ) {
			drawNode( node );
		},
		initStyle: function () {
			var _root = this.getRoot();
			minder.handelNodeInsert( _root );
			var rc = new RootShape( _root );
			translateNode( _root );
		},
		updateLayout: function ( node ) {
			drawNode( node );
			var set = updateLayoutHorizon( node );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
			}
		},
		appendChildNode: function ( parent, node, index ) {
			minder.handelNodeInsert( node );
			var _root = this.getRoot();
			var childbranch;
			if ( !node.getData( "layout" ) ) node.setData( "layout", {} );
			if ( parent.getChildren().indexOf( node ) === -1 ) {
				if ( !index ) parent.appendChild( node );
				else parent.insertChild( node, index );
			}
			var parentLayout = parent.getData( "layout" );
			var Layout = node.getData( "layout" );
			if ( parent.getType() === "root" ) {
				node.setType( "main" );
				childbranch = new MainBranch( node );
			} else {
				node.setType( "sub" );
				childbranch = new SubBranch( node );
			}
			var set1 = updateLayoutVertical( node );
			var set2 = updateLayoutHorizon( node );
			var set = uSet( set1, set2 );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				var box = set[ i ].getRenderContainer().getRenderBox();
				set[ i ].setPoint( box.x, box.y );
			}
		},
		appendSiblingNode: function ( sibling, node ) {

		},
		removeNode: function ( nodes ) {
			var root = this.getRoot();
			for ( var i = 0; i < nodes.length; i++ ) {
				var parent = nodes[ i ].getParent();
				if ( parent ) {
					var _buffer = [ nodes[ i ] ];
					var parentLayout = parent.getData( "layout" );
					while ( _buffer.length !== 0 ) {
						_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
						_buffer[ 0 ].getData( "layout" ).shape.clear();
						_buffer[ 0 ].getRenderContainer().remove();
						var prt = _buffer[ 0 ].getParent();
						prt.removeChild( _buffer[ 0 ] );
						_buffer.shift();
					}
					if ( parent === root ) {
						var Layout = nodes[ i ].getData( "layout" );
						var appendside = Layout.appendside;
						var sideList = parentLayout[ appendside + "List" ];
						var idx = sideList.indexOf( nodes[ i ] );
						sideList.splice( idx, 1 );
					}
					parent.removeChild( nodes[ i ] );
					var set = updateLayoutHorizon( nodes[ i ], parent, "remove" );
					for ( var j = 0; j < set.length; j++ ) {
						translateNode( set[ j ] );
					}
				}
			}
		}
	};
	this.addLayoutStyle( "bottom", _style );
	return {};
} );

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
        }
    };
}() );

kity.Draggable = ( function () {
    var Paper = kity.Paper;

    var touchable = window.ontouchstart !== undefined;
    var DRAG_START_EVENT = touchable ? 'touchstart' : 'mousedown',
        DRAG_MOVE_EVENT = touchable ? 'touchmove' : 'mousemove',
        DRAG_END_EVENT = touchable ? 'touchend' : 'mouseup';

    return kity.createClass( {
        drag: function ( opt ) {

            if ( this.dragEnabled ) {
                return;
            }

            var dragStart = opt && opt.start || this.dragStart,
                dragMove = opt && opt.move || this.dragMove,
                dragEnd = opt && opt.end || this.dragEnd,
                dragTarget = opt && opt.target || this.dragTarget || this,
                me = this;

            this.dragEnabled = true;
            this.dragTarget = dragTarget;

            function bindEvents( paper ) {

                var startPosition, lastPosition, dragging = false;

                var dragFn = function ( e ) {
                    if ( !dragging ) {
                        paper.off( DRAG_MOVE_EVENT, dragFn );
                    }

                    if ( e.originEvent.touches && e.originEvent.touches.length !== 1 ) return;

                    var currentPosition = e.getPosition();
                    var movement = {
                        x: currentPosition.x - startPosition.x,
                        y: currentPosition.y - startPosition.y
                    };
                    var delta = {
                        x: currentPosition.x - lastPosition.x,
                        y: currentPosition.y - lastPosition.y
                    };
                    var dragInfo = {
                        position: currentPosition,
                        movement: movement,
                        delta: delta
                    };
                    lastPosition = currentPosition;

                    if ( dragMove ) {
                        dragMove.call( me, dragInfo );
                    } else if ( me instanceof Paper ) {
                        // treate paper drag different
                        var view = me.getViewPort();
                        view.center.x -= movement.x;
                        view.center.y -= movement.y;
                        me.setViewPort( view );
                    } else {
                        me.translate( delta.x, delta.y );
                    }

                    dragTarget.trigger( 'dragmove', dragInfo );
                    e.stopPropagation();
                    e.preventDefault();
                };

                dragTarget.on( DRAG_START_EVENT, dragTarget._dragStartHandler = function ( e ) {
                    if ( e.originEvent.button ) {
                        return;
                    }
                    dragging = true;

                    var dragInfo = {
                        position: lastPosition = startPosition = e.getPosition()
                    };

                    if ( dragStart ) {
                        var cancel = dragStart.call( me, dragInfo ) === false;
                        if ( cancel ) {
                            return;
                        }
                    }

                    paper.on( DRAG_MOVE_EVENT, dragFn );

                    dragTarget.trigger( 'dragstart', dragInfo );

                    e.stopPropagation();
                    e.preventDefault();
                } );

                paper.on( DRAG_END_EVENT, dragTarget._dragEndHandler = function ( e ) {
                    if ( dragging ) {
                        dragging = false;
                        if ( dragEnd ) {
                            dragEnd.call( me );
                        }

                        paper.off( DRAG_MOVE_EVENT, dragFn );
                        dragTarget.trigger( 'dragend' );

                        e.stopPropagation();
                        e.preventDefault();
                    }
                } );
            }

            if ( me instanceof Paper ) {
                bindEvents( me );
            } else if ( me.getPaper() ) {
                bindEvents( me.getPaper() );
            } else {
                var listener = function ( e ) {
                    if ( e.targetShape.getPaper() ) {
                        bindEvents( e.targetShape.getPaper() );
                        me.off( 'add', listener );
                        me.off( 'treeadd', listener );
                    }
                };
                me.on( 'add treeadd', listener );
            }
            return this;
        }, // end of drag


        undrag: function () {
            var target = this.dragTarget;
            target.off( DRAG_START_EVENT, target._dragStartHandler );
            target.getPaper().off( DRAG_END_EVENT, target._dragEndHandler );
            delete target._dragStartHandler;
            delete target._dragEndHandler;
            this.dragEnabled = false;
            return this;
        }
    } );
} )();

var GM = KityMinder.Geometry;

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

var DragBox = kity.createClass( "DragBox", {
	base: kity.Group,
	constructor: function ( shapeArray, focusPoint ) {
		this.callBase();
		this._targetCount = shapeArray.length;
		this._focusPoint = focusPoint;
		this._targetArea = this._calcStartArea( shapeArray );
		this._dragArea = this._calcDragArea( focusPoint );
		this._draw();
	},
	_calcStartArea: function ( shapeArray ) {
		var area = shapeArray.pop().getRenderBox();
		while ( shapeArray.length ) {
			area = GM.mergeBox( area, shapeArray.pop().getRenderBox() );
		}
		return {
			x: area.left,
			y: area.top,
			width: area.width,
			height: area.height
		};
	},
	_calcDragArea: function ( focusPoint ) {
		var width = 80,
			height = 30;
		return {
			x: focusPoint.x - width / 2,
			y: focusPoint.y - height / 2,
			width: width,
			height: height
		};
	},
	_draw: function ( container ) {
		var d = this._dragArea;
		this._rect = new kity.Rect().fill( 'white' ).stroke( '#3399ff', 1 );
		this.addShape( this._rect.setRadius( 5 ) );
		this.addShape( new kity.Text( this._targetCount + ' item' )
			.setPosition( this._focusPoint.x, this._focusPoint.y + 5 )
			.setSize( 14 )
			.setTextAnchor( 'middle' )
			.fill( 'black' )
			.setStyle( 'cursor', 'default' ) );
	},
	shrink: function () {
		var animator = new AreaAnimator( this._targetArea, this._dragArea );
		animator.start( this._rect, 400, 'easeOutQuint' );
	},
	green: function () {
		this._rect.stroke( 'green', 2 ).setOpacity( 1 );
	},
	blue: function () {
		this._rect.stroke( '#3399ff', 1 ).setOpacity( 0.8 );
	}
} );


function findAllAncestor( nodes ) {
	var ancestors = [],
		judge;

	function hasAncestor( nodes, judge ) {
		for ( var i = nodes.length - 1; i >= 0; --i ) {
			if ( nodes[ i ].isAncestorOf( judge ) ) return true;
		}
		return false;
	}

	nodes.sort( function ( node1, node2 ) {
		return node1.getLevel() - node2.getLevel();
	} );

	while ( ( judge = nodes.pop() ) ) {
		if ( !hasAncestor( nodes, judge ) ) {
			ancestors.push( judge );
		}
	}
	return ancestors;
}

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

KityMinder.registerModule( "DragTree", function () {
	var dragStartPosition, dragBox, dragTargets, dropTargets, dragTargetBoxes, dropTarget;

	return {
		events: {
			mousedown: function ( e ) {
				var clickNode = e.getTargetNode();

				if ( !clickNode ) {
					return;
				}

				dragStartPosition = e.getPosition();

			},
			mousemove: function ( e ) {
				var currentPosition;

				if ( !dragStartPosition ) return;

				currentPosition = e.getPosition();

				if ( !dragBox ) {
					if ( GM.getDistance( currentPosition, dragStartPosition ) < 10 ) {
						return;
					}
					dragTargets = findAllAncestor( this.getSelectedNodes().slice( 0 ) );
					dropTargets = findAvailableParents( dragTargets, this.getRoot() );
					dragBox = new DragBox( dragTargets.map( function ( target ) {
						return target.getRenderContainer();
					} ), currentPosition );
					this.getRenderContainer().addShape( dragBox );
					dragBox.shrink();
				}

				dragBox.setTransform( new kity.Matrix().translate( currentPosition.x - dragStartPosition.x, currentPosition.y - dragStartPosition.y ) );

				if ( dropTarget ) {
					//dropTarget.getRenderContainer().scale( 0.8 );
					dragBox.blue();
					dropTarget = null;
				}
				dropTargets.forEach( function ( test ) {
					if ( GM.isBoxIntersect( dragBox.getRenderBox(), test.getRenderContainer().getRenderBox() ) ) {
						//test.getRenderContainer().scale( 1.25 );
						dropTarget = test;
						dragBox.green();
					}
				} );
			},
			mouseup: function ( e ) {
				dragStartPosition = null;
				if ( dragBox ) {
					dragBox.remove();
					dragBox = null;
					if ( dropTarget ) {
						dragTargets.forEach( function ( target ) {
							if ( target.parent ) {
								target.parent.removeChild( target );
								dropTarget.appendChild( target );
							}
						} );
						this.removeAllSelectedNodes();
						this.initStyle( this.getRoot() );
					}
				}
			}
		}
	};
} );

KityMinder.registerModule( "DropFile", function () {

	function init() {
		var container = this.getPaper().getContainer();
		container.addEventListener( 'dragover', onDragOver );
		container.addEventListener( 'drop', onDrop.bind( this ) );
	}

	function onDragOver( e ) {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'copy';
	}

	function onDrop( e ) {
		e.preventDefault();
		e.stopPropagation();
		var minder = this;
		if ( e.dataTransfer.files ) {
			var reader = new FileReader();
			reader.onload = function ( e ) {
				minder.importData( e.target.result );
			};
			reader.readAsText( e.dataTransfer.files[ 0 ] );
		}
	}

	return {
		events: {
			ready: init
		}
	};
} );

KityMinder.registerModule( "KeyboardModule", function () {

    function buildPositionNetwork( root ) {
        var pointIndexes = [],
            p;
        root.traverse( function ( node ) {
            p = node.getData( 'point' );
            pointIndexes.push( {
                x: p.x,
                y: p.y,
                node: node
            } );
        } );
        for ( var i = 0; i < pointIndexes.length; i++ ) {
            findClosestPointsFor( pointIndexes, i );
        }
    }

    function quadOf( p ) {
        return p.x > 0 ?
            ( p.y > 0 ? 1 : 2 ) :
            ( p.y < 0 ? 3 : 4 );
    }

    function findClosestPointsFor( pointIndexes, iFind ) {
        var find = pointIndexes[ iFind ];
        var matrix = new kity.Matrix().translate( -find.x, -find.y ).rotate( 45 );
        var most = {}, quad;
        var current;

        for ( var i = 0; i < pointIndexes.length; i++ ) {
            if ( i == iFind ) continue;
            current = matrix.transformPoint( pointIndexes[ i ].x, pointIndexes[ i ].y );
            quad = quadOf( current );
            if ( !most[ quad ] || current.length() < most[ quad ].point.length() ) {
                most[ quad ] = {
                    point: current,
                    node: pointIndexes[ i ].node
                };
            }
        }
        find.node._nearestNodes = {
            right: most[ 1 ] && most[ 1 ].node || null,
            top: most[ 2 ] && most[ 2 ].node || null,
            left: most[ 3 ] && most[ 3 ].node || null,
            down: most[ 4 ] && most[ 4 ].node || null
        };
    }


    function navigateTo( km, direction ) {
        var referNode = km.getSelectedNode();
        if ( !referNode ) {
            km.select( km.getRoot() );
            buildPositionNetwork( km.getRoot() );
            return;
        }
        var nextNode = referNode._nearestNodes[ direction ];
        if ( nextNode ) {
            km.select( nextNode, true );
        }
    }
    return {

        "events": {
            contentchange: function () {
                buildPositionNetwork( this.getRoot() );
            },
            keydown: function ( e ) {
                var keys = KityMinder.keymap;
                if ( this.receiver.isTextEditStatus() ) {
                    switch ( e.originEvent.keyCode ) {
                    case keys.Enter:
                    case keys.Tab:
                        this.fire( 'stopTextEdit' );
                        e.preventDefault();
                        break;
                    case keys.Backspace:
                    case keys.Del:
                    case keys.Left:
                    case keys.Up:
                    case keys.Right:
                    case keys.Down:
                        break;
                    }
                    return;
                }
                switch ( e.originEvent.keyCode ) {
                case keys.Enter:
                    this.execCommand( 'appendSiblingNode', new MinderNode( 'Topic' ) );
                    e.preventDefault();
                    break;
                case keys.Tab:
                    this.execCommand( 'appendChildNode', new MinderNode( 'Topic' ) );
                    e.preventDefault();
                    break;
                case keys.Backspace:
                case keys.Del:
                    this.execCommand( 'removenode' );
                    e.preventDefault();
                    break;

                case keys.Left:
                    navigateTo( this, 'left' );
                    e.preventDefault();
                    break;
                case keys.Up:
                    navigateTo( this, 'top' );
                    e.preventDefault();
                    break;
                case keys.Right:
                    navigateTo( this, 'right' );
                    e.preventDefault();
                    break;
                case keys.Down:
                    navigateTo( this, 'down' );
                    e.preventDefault();
                    break;
                }

            }
        }
    };
} );

KityMinder.registerModule( "Select", function () {
    var minder = this;
    var g = KityMinder.Geometry;

    // 框选控制
    var marqueeActivator = ( function () {
        var startPosition = null;
        var marqueeShape = new kity.Path().fill( 'rgba(255,255,255,.3)' ).stroke( 'white' );
        var marqueeMode = false;

        return {
            selectStart: function ( e ) {
                // 只接受左键
                if ( e.originEvent.button ) return;

                // 清理不正确状态
                if ( startPosition ) {
                    return this.selectEnd();
                }
                startPosition = g.snapToSharp( e.getPosition() );
                minder.getPaper().addShape( marqueeShape );
                marqueeShape.setOpacity( 0.8 ).getDrawer().clear();
            },
            selectMove: function ( e ) {
                if ( !startPosition ) return;
                var p1 = startPosition,
                    p2 = e.getPosition();

                if ( !marqueeMode ) {
                    if ( g.getDistance( p1, p2 ) < 10 ) {
                        return;
                    }
                    marqueeMode = true;
                }

                var marquee = g.getBox( p1, p2 ),
                    selectedNodes = [];

                // 使其犀利
                g.snapToSharp( marquee );

                // 选区形状更新
                marqueeShape.getDrawer().pipe( function () {
                    this.clear();
                    this.moveTo( marquee.left, marquee.top );
                    this.lineTo( marquee.right, marquee.top );
                    this.lineTo( marquee.right, marquee.bottom );
                    this.lineTo( marquee.left, marquee.bottom );
                    this.close();
                } );

                // 选中节点数据更新
                minder.getRoot().traverse( function ( node ) {
                    var renderBox = node.getRenderContainer().getRenderBox();
                    if ( g.isBoxIntersect( renderBox, marquee ) ) {
                        selectedNodes.push( node );
                    }
                } );

                minder.select( selectedNodes, true );
            },
            selectEnd: function ( e ) {
                if ( startPosition ) {
                    startPosition = null;
                }
                if ( marqueeMode ) {
                    marqueeShape.fadeOut( 200, 'ease', 0, function () {
                        marqueeShape.remove();
                    } );
                    marqueeMode = false;
                }
            }
        };
    } )();

    return {
        "events": {
            mousedown: function ( e ) {
                var clickNode = e.getTargetNode();
                if ( !clickNode ) {
                    this.removeAllSelectedNodes();
                    marqueeActivator.selectStart( e );
                } else if ( e.originEvent.shiftKey ) {
                    this.toggleSelect( clickNode );
                } else if ( !clickNode.isSelected() ) {
                    this.select( clickNode, true );
                }
            },
            mousemove: marqueeActivator.selectMove,
            mouseup: function ( e ) {
                var clickNode = e.getTargetNode();
                if ( clickNode && clickNode.isSelected() && !this.isSingleSelect() ) {
                    this.select( clickNode, true );
                }
                marqueeActivator.selectEnd( e );
            }
        }
    };
} );

KityMinder.registerModule( "HistoryModule", function () {

    var km = this;

    var Scene = kity.createClass( 'Scene', {
        constructor: function ( root ) {
            this.data = root.clone();
        },
        getData: function () {
            return this.data;
        },
        cloneData: function () {
            return this.getData().clone();
        },
        equals: function ( scene ) {
            return this.getData().equals( scene.getData() )
        }
    } );
    var HistoryManager = kity.createClass( 'HistoryManager', {
        constructor: function ( km ) {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
            this.km = km;
        },
        undo: function () {
            if ( this.hasUndo ) {
                if ( !this.list[ this.index - 1 ] && this.list.length == 1 ) {
                    this.reset();
                    return;
                }
                while ( this.list[ this.index ].equals( this.list[ this.index - 1 ] ) ) {
                    this.index--;
                    if ( this.index == 0 ) {
                        return this.restore( 0 );
                    }
                }
                this.restore( --this.index );
            }
        },
        redo: function () {
            if ( this.hasRedo ) {
                while ( this.list[ this.index ].equals( this.list[ this.index + 1 ] ) ) {
                    this.index++;
                    if ( this.index == this.list.length - 1 ) {
                        return this.restore( this.index );
                    }
                }
                this.restore( ++this.index );
            }
        },
        restore: function () {
            var scene = this.list[ this.index ];

            this.km.setRoot( scene.cloneData() );
            this.km.removeAllSelectedNodes();
            this.km.initStyle();

            this.update();
            this.km.fire('restoreScene');
            this.km.fire('contentChange');
        },
        getScene: function () {
            return new Scene( this.km.getRoot() )
        },
        saveScene: function () {
            var currentScene = this.getScene();
            var lastScene = this.list[ this.index ];
            if ( lastScene && lastScene.equals( currentScene ) ) {
                return
            }
            this.list = this.list.slice( 0, this.index + 1 );
            this.list.push( currentScene );
            //如果大于最大数量了，就把最前的剔除
            if ( this.list.length > this.km.getOptions( 'maxUndoCount' ) ) {
                this.list.shift();
            }
            this.index = this.list.length - 1;
            //跟新undo/redo状态
            this.update();
        },
        update: function () {
            this.hasRedo = !! this.list[ this.index + 1 ];
            this.hasUndo = !! this.list[ this.index - 1 ];
        },
        reset: function () {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
        }
    } );
    //为km实例添加history管理
    this.historyManager = new HistoryManager( this );

    var keys = {
            /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1,/*Command*/91:1,
            37:1, 38:1, 39:1, 40:1
        },
        keycont = 0,
        lastKeyCode,
        saveSceneTimer;
    return {
        defaultOptions: {
            maxUndoCount: 20,
            maxInputCount:20
        },
        "commands": {
            "undo": kity.createClass( "UndoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.undo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasUndo ? 0 : -1;
                },

                isNeedUndo: function () {
                    return false;
                }
            } ),
            "redo": kity.createClass( "RedoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.redo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasRedo ? 0 : -1;
                },
                isNeedUndo: function () {
                    return false;
                }
            } )
        },
        addShortcutKeys: {
            "Undo": "ctrl+90", //undo
            "Redo": "ctrl+89" //redo
        },
        "events": {
            "saveScene": function ( e ) {
                this.historyManager.saveScene();
            },
            "renderNode":function(e){
                var node = e.node;

                if(node.isHighlight()){
                    km.select(node);
                }
            },
            "keydown":function(e){
                var orgEvt = e.originEvent;
                var keyCode = orgEvt.keyCode || orgEvt.which;
                if (!keys[keyCode] && !orgEvt.ctrlKey && !orgEvt.metaKey && !orgEvt.shiftKey && !orgEvt.altKey) {


                    if (km.historyManager.list.length == 0) {
                        km.historyManager.saveScene();
                    }
                    clearTimeout(saveSceneTimer);

                    saveSceneTimer = setTimeout(function(){
                        km.historyManager.saveScene();
                    },200);

                    lastKeyCode = keyCode;
                    keycont++;
                    if (keycont >= km.getOptions('maxInputCount') ) {
                        km.historyManager.saveScene()
                    }
                }
            }
        }
    };
} );

KityMinder.registerModule( "TextEditModule", function () {
    var km = this;
    var sel = new Minder.Selection();
    var receiver = new Minder.Receiver(this);
    var range = new Minder.Range();

    this.receiver = receiver;

    var mouseDownStatus = false;

    var oneTime = 0;

    var lastEvtPosition,dir = 1;



    return {
        //插入光标
        "init":function(){
            this.getPaper().addShape(sel);
        },
        "events": {
            'beforemousedown':function(e){
                sel.setHide();
                var node = e.getTargetNode();
                if(node){
                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor','default');

                    if ( this.isSingleSelect() && node.isSelected() ) {

                        sel.collapse();
                        node.getTextShape().setStyle('cursor','text');
                        receiver.setTextEditStatus(true)
                            .setSelection(sel)
                            .setKityMinder(this)
                            .setMinderNode(node)
                            .setTextShape(textShape)
                            .setBaseOffset()
                            .setContainerStyle()
                            .setSelectionHeight()
                            .setCurrentIndex(e.getPosition())
                            .updateSelection()
                            .setRange(range);
                        mouseDownStatus = true;
                        lastEvtPosition = e.getPosition();
                    }
                }
            },
            'mouseup':function(e){
                if(!sel.collapsed){
                    receiver.updateRange(range)
                }
                mouseDownStatus = false;
                oneTime = 0;
            },
            'beforemousemove':function(e){
                if(mouseDownStatus){
                    e.stopPropagationImmediately();
                    setTimeout(function(){

                        var offset = e.getPosition();
                        dir = offset.x > lastEvtPosition.x  ? 1 : (offset.x  < lastEvtPosition.x ? -1 : dir);
                        receiver.updateSelectionByMousePosition(offset,dir)
                            .updateSelectionShow(dir);
                        sel.stroke('none',0);
                        lastEvtPosition = e.getPosition();
                    },100)
                }


            },
            'restoreScene':function(){
                sel.setHide();
            },
            'stopTextEdit':function(){
                sel.setHide();

            }
        }
    };
} );

Minder.Range = kity.createClass('Range',{
    constructor : function(){
        this.nativeRange = document.createRange();
        this.nativeSel = window.getSelection();
    },
    select:function(){
        var start = this.nativeRange.startContainer;
        if(start.nodeType == 1 && start.childNodes.length == 0){
            var char = document.createTextNode('\u200b');
            start.appendChild(char);
            this.nativeRange.setStart(char,1);
            this.nativeRange.collapse(true);
        }
        this.nativeSel.removeAllRanges();
        this.nativeSel.addRange(this.nativeRange);
        return this;
    },
    setStart:function(node,index){
        this.nativeRange.setStart(node,index);
        return this;
    },
    setEnd:function(node,index){
        this.nativeRange.setEnd(node,index);
        return this;
    },
    getStart:function(){
        var range = this.nativeSel.getRangeAt(0);
        return {
            startContainer:range.startContainer,
            startOffset:range.startOffset
        }
    },
    collapse:function(toStart){
        this.nativeRange.collapse(toStart === true);
        return this;
    },
    insertNode:function(node){
        this.nativeRange.insertNode(node);
        return this;
    }
});

//接收者
Minder.Receiver = kity.createClass('Receiver',{
    clear : function(){
        this.container.innerHTML = '';
        this.selection.setHide();
        this.index = 0;
        return this;
    },
    setTextEditStatus : function(status){
        this.textEditStatus = status || false;
        return this;
    },
    isTextEditStatus:function(){
        return this.textEditStatus;
    },
    constructor : function(km){
        this.setKityMinder(km);
        this.textEditStatus = false;
        var _div = document.createElement('div');
        _div.setAttribute('contenteditable',true);
        _div.className = 'km_receiver';
        this.container = document.body.insertBefore(_div,document.body.firstChild);
        utils.addCssRule('km_receiver_css',' .km_receiver{position:absolute;padding:0;margin:0;word-wrap:break-word;clip:rect(1em 1em 1em 1em);}');//
        this.km.on('beforekeyup', utils.proxy(this.keyboardEvents,this));
        this.timer = null;
        this.index = 0;
    },
    setRange : function(range,index){

        this.index = index || this.index;

        var text = this.container.firstChild;
        this.range = range;
        range.setStart(text || this.container, this.index).collapse(true);
        setTimeout(function(){
            range.select()
        });
        return this;
    },
    setTextShape:function(textShape){
        if(!textShape){
            textShape = new kity.Text();
        }
        this.textShape = textShape;
        this.container.innerHTML = textShape.getContent();
        return this;
    },
    setTextShapeSize:function(size){
        this.textShape.setSize(size);
        return this;
    },
    getTextShapeHeight:function(){
        return this.textShape.getRenderBox().height;
    },
    appendTextShapeToPaper:function(paper){
        paper.addShape(this.textShape);
        return this;
    },
    setKityMinder:function(km){
        this.km = km;
        return this;
    },
    setMinderNode:function(node){
        this.minderNode = node;
        return this;
    },
    keyboardEvents : function(e){

        clearTimeout(this.timer);
        var me = this;
        var orgEvt = e.originEvent;
        var keyCode = orgEvt.keyCode;
        switch(e.type){

            case 'beforekeyup':
                if(this.isTextEditStatus()){
                    switch(keyCode){
                        case keymap.Enter:
                        case keymap.Tab:
                            this.setTextEditStatus(false);
                            this.clear();
                            e.preventDefault();
                            return;
                        case keymap.Shift:
                        case keymap.Control:
                        case keymap.Alt:
                        case keymap.Cmd:
                            return;

                    }
                    var text = (this.container.textContent || this.container.innerText).replace(/\u200b/g,'');


                    this.textShape.setContent(text);
                    this.setContainerStyle();
                    this.minderNode.setText(text);

                    this.km.updateLayout(this.minderNode);
                    this.setBaseOffset();
                    this.updateTextData();
                    this.updateIndex();
                    this.updateSelection();

                    this.timer = setTimeout(function(){
                        me.selection.setShow()
                },500);
                    return true;
                }

        }
    },
    updateIndex:function(){
        this.index = this.range.getStart().startOffset;
    },
    updateTextData : function(){
        this.textShape.textData =  this.getTextOffsetData();
    },
    setSelection : function(selection){
        this.selection = selection;
        return this;
    },
    updateSelection : function(){
        this.selection.setShowHold();
        this.selection.bringTop();
        //更新模拟选区的范围
        this.selection.setStartOffset(this.index).collapse(true);
        if(this.index == this.textData.length){

            this.selection.setPosition({
                x : this.textData[this.index-1].x + this.textData[this.index-1].width,
                y : this.textData[this.index-1].y
            })
        }else{
            this.selection.setPosition(this.textData[this.index])
        }
        return this;
    },
    setBaseOffset :function(){

        var nodeOffset = this.minderNode.getRenderContainer().getRenderBox();
//        var textOffset = this.textShape.getRenderBox();
        var contRcOffset = this.minderNode.getContRc().getRenderBox();

        this.offset =   {
            x : nodeOffset.x +  contRcOffset.x,
            y : nodeOffset.y +  contRcOffset.y
        };
        return this;
    },
    setContainerStyle : function(){
        var textShapeBox = this.textShape.getRenderBox();

        this.container.style.cssText =  ";left:" + this.offset.x
            + 'px;top:' + (this.offset.y+textShapeBox.height)
            + 'px;width:' + textShapeBox.width
            + 'px;height:' + textShapeBox.height + 'px;';
        return this;
    },
    getTextOffsetData:function(){
        var text = this.textShape.getContent();
        this.textData = [];

        for(var i= 0,l = text.length;i<l;i++){
            var box = this.textShape.getExtentOfChar(i);
            this.textData.push({
                x:box.x + this.offset.x,
                y:this.offset.y,
                width:box.width,
                height:box.height
            })
        }
        return this;
    },
    setCurrentIndex:function(offset){
        var me = this;
        this.getTextOffsetData();
        var hadChanged = false;
        utils.each(this.textData,function(i,v){
            //点击开始之前
            if(i == 0 && offset.x <= v.x){
                me.index = 0;
                return false;
            }

            if(i == me.textData.length -1 && offset.x >= v.x){
                me.index = me.textData.length;
                return false;
            }
            if(offset.x >= v.x && offset.x <= v.x + v.width){
                if(offset.x  - v.x > v.width/2){
                    me.index = i + 1;

                }else {
                    me.index = i

                }
                hadChanged = true;
                return false;
            }
        });
        return this;

    },
    setSelectionHeight:function(){
        this.selection.setHeight(this.getTextShapeHeight());
        return this;
    },

    updateSelectionByMousePosition:function(offset,dir){

        var me = this;
        utils.each(this.textData,function(i,v){
            //点击开始之前
            if(i == 0 && offset.x <= v.x){
                me.selection.setStartOffset(0);
                return false;
            }

            if(i == me.textData.length -1 && offset.x >= v.x){
                me.selection.setEndOffset(me.textData.length);
                return false;
            }
            if(offset.x >= v.x && offset.x <= v.x + v.width){

                if(me.index == i){
                    me.selection.setEndOffset(i + (dir == 1 ? 1 : 0))
                }else if(i > me.index){
                    me.selection.setEndOffset(i + (dir == 1 ? 1 : 0))
                }else{
                    me.selection.setStartOffset(i + (dir == 1 ? 1 : 0))
                }

                return false;
            }
        });
        return this;
    },
    updateSelectionShow:function(){

        var startOffset = this.textData[this.selection.startOffset],
            endOffset = this.textData[this.selection.endOffset],
            width = 0 ;
        if(this.selection.collapsed){

            this.selection.updateShow(startOffset,0);
            return this;
        }
        if(!endOffset){
            var lastOffset = this.textData[this.textData.length -1];
            width = lastOffset.x - startOffset.x + lastOffset.width;
        }else{
            width = endOffset.x - startOffset.x;
        }

        this.selection.updateShow(startOffset,width);
        return this;
    },
    updateRange:function(range){
        var node = this.container.firstChild;
        range.setStart(node,this.selection.startOffset);
        range.setEnd(node,this.selection.endOffset);
        range.select();
        return this;
    }
});

//模拟光标
Minder.Selection = kity.createClass( 'Selection', {
    base: kity.Rect,
    constructor: function ( height, color, width ) {
        this.callBase();
        this.height = height || 20;

        this.stroke( color || 'blue', width || 1 );
        this.width = 1;
        this.fill('#99C8FF');
        this.setHide();
        this.timer = null;
        this.collapsed = true;
        this.startOffset = this.endOffset = 0;
        this.setOpacity(0.5)
    },
    collapse : function(toEnd){

        this.stroke( 'blue', 1 );
        this.width = 1;
        this.collapsed = true;
        if(toEnd){
            this.startOffset = this.endOffset
        }else{
            this.endOffset = this.startOffset;
        }
        return this;
    },
    setStartOffset:function(offset){
        this.startOffset = offset;
        var tmpOffset = this.startOffset;
        if(this.startOffset > this.endOffset){
            this.startOffset = this.endOffset;
            this.endOffset = tmpOffset;
        }else if(this.startOffset == this.endOffset){
            this.collapse();
            return this;
        }
        this.collapsed = false;
        this.stroke('none');
        return this;
    },
    setEndOffset:function(offset){
        this.endOffset = offset;
        var tmpOffset = this.endOffset;
        if(this.endOffset < this.startOffset){
            this.endOffset = this.startOffset;
            this.startOffset = tmpOffset;
        }else if(this.startOffset == this.endOffset){
            this.collapse();
            return this;
        }
        this.collapsed = false;
        this.stroke('none');
        return this;
    },
    updateShow : function(offset,width){
        this.setPosition(offset).setWidth(width);
        return this;
    },
    setPosition: function ( offset ) {
        try {
            this.x = offset.x;
            this.y = offset.y;

        } catch ( e ) {
            console.log(e)
        }

        return this.update();
    },
    setHeight: function ( height ) {
        this.height = height;
    },
    setHide: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', 'none' );
        return this;
    },
    setShowHold: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', '' );
        return this;
    },
    setShow: function () {
        clearInterval( this.timer );
        var me = this,
            state = '';
        this.timer = setInterval( function () {
            me.setStyle( 'display', state );
            state = state ? '' : 'none';
        }, 300 );
        return this;
    },
    setTextShape: function ( text ) {
        if ( !text ) {
            this.text = new kity.Text();
        } else {
            this.text = text;
        }
        return this
    },
    getTextShape: function () {
        return this.text
    },
    setTxtContent: function ( text ) {
        this.text.setContent( text )
    },
    updatePosition: function ( index ) {

    }
} );

KityMinder.registerModule( "basestylemodule", function () {
    var km = this;
    return {

        "commands": {
            "bold": kity.createClass( "boldCommand", {
                base: Command,

                execute: function (  ) {

                    var nodes = km.getSelectedNodes();
                    if(this.queryState('bold') == 1){
                        utils.each(nodes,function(i,n){
                            n.setData('bold');
                            n.getTextShape().setAttr('font-weight');
                            km.updateLayout(n)
                        })
                    }else{
                        utils.each(nodes,function(i,n){
                            n.setData('bold',true);
                            n.getTextShape().setAttr('font-weight','bold');
                            km.updateLayout(n)
                        })
                    }
                },
                queryState: function (  ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    utils.each(nodes,function(i,n){
                        if(n.getData('bold')){
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            } ),
            "italic": kity.createClass( "italicCommand", {
                base: Command,

                execute: function (  ) {

                    var nodes = km.getSelectedNodes();
                    if(this.queryState('italic') == 1){
                        utils.each(nodes,function(i,n){
                            n.setData('italic');
                            n.getTextShape().setAttr('font-style');
                            km.updateLayout(n)
                        })
                    }else{
                        utils.each(nodes,function(i,n){
                            n.setData('italic',true);
                            n.getTextShape().setAttr('font-style','italic');
                            km.updateLayout(n)
                        })
                    }
                },
                queryState: function (  ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    utils.each(nodes,function(i,n){
                        if(n.getData('italic')){
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            } )
        },
        addShortcutKeys: {
            "bold": "ctrl+66", //bold
            "italic": "ctrl+73" //italic
        },
        "events": {
            "beforeRenderNode": function ( e ) {
                //加粗
                if(e.node.getData('bold')){
                    e.node.getTextShape().setAttr('font-weight','bold');
                }

                if(e.node.getData('italic')){
                    e.node.getTextShape().setAttr('font-style','italic');
                }
            }
        }
    };
} );

KityMinder.registerModule( "fontmodule", function () {

    return {
        defaultOptions: {
            'fontfamily': [ {
                name: 'songti',
                val: '宋体,SimSun'
            }, {
                name: 'yahei',
                val: '微软雅黑,Microsoft YaHei'
            }, {
                name: 'kaiti',
                val: '楷体,楷体_GB2312, SimKai'
            }, {
                name: 'heiti',
                val: '黑体, SimHei'
            }, {
                name: 'lishu',
                val: '隶书, SimLi'
            }, {
                name: 'andaleMono',
                val: 'andale mono'
            }, {
                name: 'arial',
                val: 'arial, helvetica,sans-serif'
            }, {
                name: 'arialBlack',
                val: 'arial black,avant garde'
            }, {
                name: 'comicSansMs',
                val: 'comic sans ms'
            }, {
                name: 'impact',
                val: 'impact,chicago'
            }, {
                name: 'timesNewRoman',
                val: 'times new roman'
            }, {
                name: 'sans-serif',
                val: 'sans-serif'
            } ],
            'fontsize': [ 10, 12, 16, 18, 24, 32, 48 ]
        },
        "commands": {
            "forecolor": kity.createClass( "fontcolorCommand", {
                base: Command,

                execute: function ( km, color ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'fontcolor', color );
                        n.getTextShape().fill( color )
                    } )
                }

            } ),
            "fontfamily": kity.createClass( "fontfamilyCommand", {
                base: Command,

                execute: function ( km, family ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'fontfamily', family );
                        n.getTextShape().setAttr( 'font-family', family );
                        km.updateLayout( n )
                    } )
                }
            } ),
            "fontsize": kity.createClass( "fontsizeCommand", {
                base: Command,

                execute: function ( km, size ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'fontsize', size );
                        n.getTextShape().setSize( size );
                        km.updateLayout( n )
                    } )
                }
            } )
        },

        "events": {
            "beforeRenderNode": function ( e ) {
                var val;
                if ( val = e.node.getData( 'fontfamily' ) ) {
                    e.node.getTextShape().setAttr( 'font-family', val );
                }
                if ( val = e.node.getData( 'fontcolor' ) ) {
                    e.node.getTextShape().fill( val );
                }
                if ( val = e.node.getData( 'fontsize' ) ) {
                    e.node.getTextShape().setSize( val );
                }
            }
        }
    };
} );

KityMinder.registerModule( 'Zoom', function () {
	/*
	return {
		events: {
			'mousewheel': function ( e ) {
				if ( e.originEvent.wheelDelta > 0 ) {
					if ( this._zoom < 0.2 ) return;
					this._zoom *= 0.95;
					this.getRenderContainer().scale( 0.95 );
				} else {
					if ( this._zoom > 5 ) return;
					this._zoom /= 0.95;
					this.getRenderContainer().scale( 1 / 0.95 );
				}
				e.originEvent.preventDefault();
			},
			'ready': function () {
				this._zoom = 1;
			}
		}
	};*/
	return {};
} );

(function ($) {
    //对jquery的扩展
    $.parseTmpl = function parse(str, data) {
        var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' + 'with(obj||{}){__p.push(\'' + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/<%=([\s\S]+?)%>/g,function (match, code) {
            return "'," + code.replace(/\\'/g, "'") + ",'";
        }).replace(/<%([\s\S]+?)%>/g,function (match, code) {
                return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('";
            }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + "');}return __p.join('');";
        var func = new Function('obj', tmpl);
        return data ? func(data) : func;
    };
    $.extend2 = function (t, s) {
        var a = arguments,
            notCover = $.type(a[a.length - 1]) == 'boolean' ? a[a.length - 1] : false,
            len = $.type(a[a.length - 1]) == 'boolean' ? a.length - 1 : a.length;
        for (var i = 1; i < len; i++) {
            var x = a[i];
            for (var k in x) {
                if (!notCover || !t.hasOwnProperty(k)) {
                    t[k] = x[k];
                }
            }
        }
        return t;
    };

    $.IE6 = !!window.ActiveXObject && parseFloat(navigator.userAgent.match(/msie (\d+)/i)[1]) == 6;

    //所有ui的基类
    var _eventHandler = [];
    var _widget = function () {
    };
    var _prefix = 'kmui';
    _widget.prototype = {
        on: function (ev, cb) {
            this.root().on(ev, $.proxy(cb, this));
            return this;
        },
        off: function (ev, cb) {
            this.root().off(ev, $.proxy(cb, this));
            return this;
        },
        trigger: function (ev, data) {
            return  this.root().trigger(ev, data) === false ? false : this;
        },
        root: function ($el) {
            return this._$el || (this._$el = $el);
        },
        destroy: function () {

        },
        data: function (key, val) {
            if (val !== undefined) {
                this.root().data(_prefix + key, val);
                return this;
            } else {
                return this.root().data(_prefix + key)
            }
        },
        register: function (eventName, $el, fn) {
            _eventHandler.push({
                'evtname': eventName,
                '$els': $.isArray($el) ? $el : [$el],
                handler: $.proxy(fn, $el)
            })
        }
    };

    //从jq实例上拿到绑定的widget实例
    $.fn.kmui = function (obj) {
        return obj ? this.data('kmuiwidget', obj) : this.data('kmuiwidget');
    };

    function _createClass(ClassObj, properties, supperClass) {
        ClassObj.prototype = $.extend2(
            $.extend({}, properties),
            (KM.ui[supperClass] || _widget).prototype,
            true
        );
        ClassObj.prototype.supper = (KM.ui[supperClass] || _widget).prototype;
        //父class的defaultOpt 合并
        if( KM.ui[supperClass] && KM.ui[supperClass].prototype.defaultOpt ) {

            var parentDefaultOptions = KM.ui[supperClass].prototype.defaultOpt,
                subDefaultOptions = ClassObj.prototype.defaultOpt;

            ClassObj.prototype.defaultOpt = $.extend( {}, parentDefaultOptions, subDefaultOptions || {} );

        }
        return ClassObj
    }

    var _guid = 1;

    function mergeToJQ(ClassObj, className) {
        $[_prefix + className] = ClassObj;
        $.fn[_prefix + className] = function (opt) {
            var result, args = Array.prototype.slice.call(arguments, 1);

            this.each(function (i, el) {
                var $this = $(el);
                var obj = $this.kmui();
                if (!obj) {
                    ClassObj(!opt || !$.isPlainObject(opt) ? {} : opt, $this);
                    $this.kmui(obj)
                }
                if ($.type(opt) == 'string') {
                    if (opt == 'this') {
                        result = obj;
                    } else {
                        result = obj[opt].apply(obj, args);
                        if (result !== obj && result !== undefined) {
                            return false;
                        }
                        result = null;
                    }

                }
            });

            return result !== null ? result : this;
        }
    }

    KM.ui = {
        define: function (className, properties, supperClass) {
            var ClassObj = KM.ui[className] = _createClass(function (options, $el) {
                    var _obj = function () {
                    };
                    $.extend(_obj.prototype, ClassObj.prototype, {
                            guid: className + _guid++,
                            widgetName: className
                        }
                    );
                    var obj = new _obj;
                    if ($.type(options) == 'string') {
                        obj.init && obj.init({});
                        obj.root().kmui(obj);
                        obj.root().find('a').click(function (evt) {
                            evt.preventDefault()
                        });
                        return obj.root()[_prefix + className].apply(obj.root(), arguments)
                    } else {
                        $el && obj.root($el);
                        obj.init && obj.init(!options || $.isPlainObject(options) ? $.extend2(options || {}, obj.defaultOpt || {}, true) : options);
                        try{
                            obj.root().find('a').click(function (evt) {
                                evt.preventDefault()
                            });
                        }catch(e){
                        }

                        return obj.root().kmui(obj);
                    }

                },properties, supperClass);

            mergeToJQ(ClassObj, className);
        }
    };

    $(function () {
        $(document).on('click mouseup mousedown dblclick mouseover', function (evt) {
            $.each(_eventHandler, function (i, obj) {
                if (obj.evtname == evt.type) {
                    $.each(obj.$els, function (i, $el) {
                        if ($el[0] !== evt.target && !$.contains($el[0], evt.target)) {
                            obj.handler(evt);
                        }
                    })
                }
            })
        })
    })
})(jQuery);

//button 类
KM.ui.define('button', {
    tpl: '<<%if(!texttype){%>div class="kmui-btn kmui-btn-<%=icon%> <%if(name){%>kmui-btn-name-<%=name%><%}%>" unselectable="on" onmousedown="return false" <%}else{%>a class="kmui-text-btn"<%}%><% if(title) {%> data-original-title="<%=title%>" <%};%>> ' +
        '<% if(icon) {%><div unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><% }; %><%if(text) {%><span unselectable="on" onmousedown="return false" class="kmui-button-label"><%=text%></span><%}%>' +
        '<%if(caret && text){%><span class="kmui-button-spacing"></span><%}%>' +
        '<% if(caret) {%><span unselectable="on" onmousedown="return false" class="kmui-caret"></span><% };%></<%if(!texttype){%>div<%}else{%>a<%}%>>',
    defaultOpt: {
        text: '',
        title: '',
        icon: '',
        width: '',
        caret: false,
        texttype: false,
        click: function () {
        }
    },
    init: function (options) {
        var me = this;

        me.root($($.parseTmpl(me.tpl, options)))
            .click(function (evt) {
                me.wrapclick(options.click, evt)
            });

        me.root().hover(function () {
            if(!me.root().hasClass("kmui-disabled")){
                me.root().toggleClass('kmui-hover')
            }
        })

        return me;
    },
    wrapclick: function (fn, evt) {
        if (!this.disabled()) {
            this.root().trigger('wrapclick');
            $.proxy(fn, this, evt)()
        }
        return this;
    },
    label: function (text) {
        if (text === undefined) {
            return this.root().find('.kmui-button-label').text();
        } else {
            this.root().find('.kmui-button-label').text(text);
            return this;
        }
    },
    disabled: function (state) {
        if (state === undefined) {
            return this.root().hasClass('kmui-disabled')
        }
        this.root().toggleClass('kmui-disabled', state);
        if(this.root().hasClass('kmui-disabled')){
            this.root().removeClass('kmui-hover')
        }
        return this;
    },
    active: function (state) {
        if (state === undefined) {
            return this.root().hasClass('kmui-active')
        }
        this.root().toggleClass('kmui-active', state)

        return this;
    },
    mergeWith: function ($obj) {
        var me = this;
        me.data('$mergeObj', $obj);
        $obj.kmui().data('$mergeObj', me.root());
        if (!$.contains(document.body, $obj[0])) {
            $obj.appendTo(me.root());
        }
        me.on('click',function () {
            me.wrapclick(function () {
                $obj.kmui().show();
            })
        }).register('click', me.root(), function (evt) {
                $obj.hide()
            });
    }
});

//toolbar 类
(function () {
    KM.ui.define('toolbar', {
        tpl: '<div class="kmui-toolbar"  ><div class="kmui-btn-toolbar" unselectable="on" onmousedown="return false"  ></div></div>'
          ,
        init: function () {
            var $root = this.root($(this.tpl));
            this.data('$btnToolbar', $root.find('.kmui-btn-toolbar'))
        },
        appendToBtnmenu : function(data){
            var $cont = this.data('$btnToolbar');
            data = $.isArray(data) ? data : [data];
            $.each(data,function(i,$item){
                $cont.append($item)
            })
        }
    });
})();


//menu 类
KM.ui.define('menu',{
    show : function($obj,dir,fnname,topOffset,leftOffset){

        fnname = fnname || 'position';
        if(this.trigger('beforeshow') === false){
            return;
        }else{
            this.root().css($.extend({display:'block'},$obj ? {
                top : $obj[fnname]().top + ( dir == 'right' ? 0 : $obj.outerHeight()) - (topOffset || 0),
                left : $obj[fnname]().left + (dir == 'right' ?  $obj.outerWidth() : 0) -  (leftOffset || 0)
            }:{}))
            this.trigger('aftershow');
        }
    },
    hide : function(all){
        var $parentmenu;
        if(this.trigger('beforehide') === false){
            return;
        } else {

            if($parentmenu = this.root().data('parentmenu')){
                if($parentmenu.data('parentmenu')|| all)
                    $parentmenu.kmui().hide();
            }
            this.root().css('display','none');
            this.trigger('afterhide');
        }
    },
    attachTo : function($obj){
        var me = this;
        if(!$obj.data('$mergeObj')){
            $obj.data('$mergeObj',me.root());
            $obj.on('wrapclick',function(evt){
                me.show()
            });
            me.register('click',$obj,function(evt){
               me.hide()
            });
            me.data('$mergeObj',$obj)
        }
    }
});

//dropmenu 类
KM.ui.define('dropmenu', {
    tmpl: '<ul class="kmui-dropdown-menu" aria-labelledby="dropdownMenu" >' +
        '<%for(var i=0,ci;ci=data[i++];){%>' +
        '<%if(ci.divider){%><li class="kmui-divider"></li><%}else{%>' +
        '<li <%if(ci.active||ci.disabled){%>class="<%= ci.active|| \'\' %> <%=ci.disabled||\'\' %>" <%}%> data-value="<%= ci.value%>">' +
        '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= ci.label%></a>' +
        '</li><%}%>' +
        '<%}%>' +
        '</ul>',
    defaultOpt: {
        data: [],
        click: function () {

        }
    },
    init: function (options) {
        var me = this;
        var eventName = {
            click: 1,
            mouseover: 1,
            mouseout: 1
        };

        this.root($($.parseTmpl(this.tmpl, options))).on('click', 'li[class!="kmui-disabled kmui-divider kmui-dropdown-submenu"]',function (evt) {
            $.proxy(options.click, me, evt, $(this).data('value'), $(this))()
        }).find('li').each(function (i, el) {
                var $this = $(this);
                if (!$this.hasClass("kmui-disabled kmui-divider kmui-dropdown-submenu")) {
                    var data = options.data[i];
                    $.each(eventName, function (k) {
                        data[k] && $this[k](function (evt) {
                            $.proxy(data[k], el)(evt, data, me.root)
                        })
                    })
                }
            })

    },
    disabled: function (cb) {
        $('li[class!=kmui-divider]', this.root()).each(function () {
            var $el = $(this);
            if (cb === true) {
                $el.addClass('kmui-disabled')
            } else if ($.isFunction(cb)) {
                $el.toggleClass('kmui-disabled', cb(li))
            } else {
                $el.removeClass('kmui-disabled')
            }

        });
    },
    val: function (val) {
        var currentVal;
        $('li[class!="kmui-divider kmui-disabled kmui-dropdown-submenu"]', this.root()).each(function () {
            var $el = $(this);
            if (val === undefined) {
                if ($el.find('em.kmui-dropmenu-checked').length) {
                    currentVal = $el.data('value');
                    return false
                }
            } else {
                $el.find('em').toggleClass('kmui-dropmenu-checked', $el.data('value') == val)
            }
        });
        if (val === undefined) {
            return currentVal
        }
    },
    addSubmenu: function (label, menu, index) {
        index = index || 0;

        var $list = $('li[class!=kmui-divider]', this.root());
        var $node = $('<li class="kmui-dropdown-submenu"><a tabindex="-1" href="#">' + label + '</a></li>').append(menu);

        if (index >= 0 && index < $list.length) {
            $node.insertBefore($list[index]);
        } else if (index < 0) {
            $node.insertBefore($list[0]);
        } else if (index >= $list.length) {
            $node.appendTo($list);
        }
    }
}, 'menu');

//splitbutton 类
///import button
KM.ui.define('splitbutton',{
    tpl :'<div class="kmui-splitbutton <%if (name){%>kmui-splitbutton-<%= name %><%}%>"  unselectable="on" <%if(title){%>data-original-title="<%=title%>"<%}%>><div class="kmui-btn"  unselectable="on" ><%if(icon){%><div  unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><%}%><%if(text){%><%=text%><%}%></div>'+
            '<div  unselectable="on" class="kmui-btn kmui-dropdown-toggle" >'+
                '<div  unselectable="on" class="kmui-caret"><\/div>'+
            '</div>'+
        '</div>',
    defaultOpt:{
        text:'',
        title:'',
        click:function(){}
    },
    init : function(options){
        var me = this;
        me.root( $($.parseTmpl(me.tpl,options)));
        me.root().find('.kmui-btn:first').click(function(evt){
            if(!me.disabled()){
                $.proxy(options.click,me)();
            }
        });
        me.root().find('.kmui-dropdown-toggle').click(function(){
            if(!me.disabled()){
                me.trigger('arrowclick')
            }
        });
        me.root().hover(function () {
            if(!me.root().hasClass("kmui-disabled")){
                me.root().toggleClass('kmui-hover')
            }
        });

        return me;
    },
    wrapclick:function(fn,evt){
        if(!this.disabled()){
            $.proxy(fn,this,evt)()
        }
        return this;
    },
    disabled : function(state){
        if(state === undefined){
            return this.root().hasClass('kmui-disabled')
        }
        this.root().toggleClass('kmui-disabled',state).find('.kmui-btn').toggleClass('kmui-disabled',state);
        return this;
    },
    active:function(state){
        if(state === undefined){
            return this.root().hasClass('kmui-active')
        }
        this.root().toggleClass('kmui-active',state).find('.kmui-btn:first').toggleClass('kmui-active',state);
        return this;
    },
    mergeWith:function($obj){
        var me = this;
        me.data('$mergeObj',$obj);
        $obj.kmui().data('$mergeObj',me.root());
        if(!$.contains(document.body,$obj[0])){
            $obj.appendTo(me.root());
        }
        me.root().delegate('.kmui-dropdown-toggle','click',function(){
            me.wrapclick(function(){
                $obj.kmui().show();
            })
        });
        me.register('click',me.root().find('.kmui-dropdown-toggle'),function(evt){
            $obj.hide()
        });
    }
});

/**
 * Created with JetBrains PhpStorm.
 * User: hn
 * Date: 13-7-10
 * Time: 下午3:07
 * To change this template use File | Settings | File Templates.
 */
KM.ui.define('colorsplitbutton',{

    tpl : '<div class="kmui-splitbutton <%if (name){%>kmui-splitbutton-<%= name %><%}%>"  unselectable="on" <%if(title){%>data-original-title="<%=title%>"<%}%>><div class="kmui-btn"  unselectable="on" ><%if(icon){%><div  unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><%}%><div class="kmui-splitbutton-color-label" <%if (color) {%>style="background: <%=color%>"<%}%>></div><%if(text){%><%=text%><%}%></div>'+
            '<div  unselectable="on" class="kmui-btn kmui-dropdown-toggle" >'+
            '<div  unselectable="on" class="kmui-caret"><\/div>'+
            '</div>'+
            '</div>',
    defaultOpt: {
        color: ''
    },
    init: function( options ){

        var me = this;

        me.supper.init.call( me, options );

    },
    colorLabel: function(){
        return this.root().find('.kmui-splitbutton-color-label');
    }

}, 'splitbutton');

//popup 类
KM.ui.define('popup', {
    tpl: '<div class="kmui-dropdown-menu kmui-popup"'+
        '<%if(!<%=stopprop%>){%>onmousedown="return false"<%}%>'+
        '><div class="kmui-popup-body" unselectable="on" onmousedown="return false"><%=subtpl%></div>' +
        '<div class="kmui-popup-caret"></div>' +
        '</div>',
    defaultOpt: {
        stopprop:false,
        subtpl: '',
        width: '',
        height: ''
    },
    init: function (options) {
        this.root($($.parseTmpl(this.tpl, options)));
        return this;
    },
    mergeTpl: function (data) {
        return $.parseTmpl(this.tpl, {subtpl: data});
    },
    show: function ($obj, posObj) {
        if (!posObj) posObj = {};

        var fnname = posObj.fnname || 'position';
        if (this.trigger('beforeshow') === false) {
            return;
        } else {
            this.root().css($.extend({display: 'block'}, $obj ? {
                top: $obj[fnname]().top + ( posObj.dir == 'right' ? 0 : $obj.outerHeight()) - (posObj.offsetTop || 0),
                left: $obj[fnname]().left + (posObj.dir == 'right' ? $obj.outerWidth() : 0) - (posObj.offsetLeft || 0),
                position: 'absolute'
            } : {}));

            this.root().find('.kmui-popup-caret').css({
                top: posObj.caretTop || 0,
                left: posObj.caretLeft || 0,
                position: 'absolute'
            }).addClass(posObj.caretDir || "up")

        }
        this.trigger("aftershow");
    },
    hide: function () {
        this.root().css('display', 'none');
        this.trigger('afterhide')
    },
    attachTo: function ($obj, posObj) {
        var me = this
        if (!$obj.data('$mergeObj')) {
            $obj.data('$mergeObj', me.root());
            $obj.on('wrapclick', function (evt) {
                me.show($obj, posObj)
            });
            me.register('click', $obj, function (evt) {
                me.hide()
            });
            me.data('$mergeObj', $obj)
        }
    },
    getBodyContainer: function () {
        return this.root().find(".kmui-popup-body");
    }
});

//scale 类
KM.ui.define('scale', {
    tpl: '<div class="kmui-scale" unselectable="on">' +
        '<span class="kmui-scale-hand0"></span>' +
        '<span class="kmui-scale-hand1"></span>' +
        '<span class="kmui-scale-hand2"></span>' +
        '<span class="kmui-scale-hand3"></span>' +
        '<span class="kmui-scale-hand4"></span>' +
        '<span class="kmui-scale-hand5"></span>' +
        '<span class="kmui-scale-hand6"></span>' +
        '<span class="kmui-scale-hand7"></span>' +
        '</div>',
    defaultOpt: {
        $doc: $(document),
        $wrap: $(document)
    },
    init: function (options) {
        if(options.$doc) this.defaultOpt.$doc = options.$doc;
        if(options.$wrap) this.defaultOpt.$wrap = options.$wrap;
        this.root($($.parseTmpl(this.tpl, options)));
        this.initStyle();
        this.startPos = this.prePos = {x: 0, y: 0};
        this.dragId = -1;
        return this;
    },
    initStyle: function () {
        utils.cssRule('kmui-style-scale', '.kmui-scale{display:none;position:absolute;border:1px solid #38B2CE;cursor:hand;}' +
            '.kmui-scale span{position:absolute;left:0;top:0;width:7px;height:7px;overflow:hidden;font-size:0px;display:block;background-color:#3C9DD0;}'
            + '.kmui-scale .kmui-scale-hand0{cursor:nw-resize;top:0;margin-top:-4px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand1{cursor:n-resize;top:0;margin-top:-4px;left:50%;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand2{cursor:ne-resize;top:0;margin-top:-4px;left:100%;margin-left:-3px;}'
            + '.kmui-scale .kmui-scale-hand3{cursor:w-resize;top:50%;margin-top:-4px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand4{cursor:e-resize;top:50%;margin-top:-4px;left:100%;margin-left:-3px;}'
            + '.kmui-scale .kmui-scale-hand5{cursor:sw-resize;top:100%;margin-top:-3px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand6{cursor:s-resize;top:100%;margin-top:-3px;left:50%;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand7{cursor:se-resize;top:100%;margin-top:-3px;left:100%;margin-left:-3px;}');
    },
    _eventHandler: function (e) {
        var me = this,
            $doc = me.defaultOpt.$doc;
        switch (e.type) {
            case 'mousedown':
                var hand = e.target || e.srcElement, hand;
                if (hand.className.indexOf('kmui-scale-hand') != -1) {
                    me.dragId = hand.className.slice(-1);
                    me.startPos.x = me.prePos.x = e.clientX;
                    me.startPos.y = me.prePos.y = e.clientY;
                    $doc.bind('mousemove', $.proxy(me._eventHandler, me));
                }
                break;
            case 'mousemove':
                if (me.dragId != -1) {
                    me.updateContainerStyle(me.dragId, {x: e.clientX - me.prePos.x, y: e.clientY - me.prePos.y});
                    me.prePos.x = e.clientX;
                    me.prePos.y = e.clientY;
                    me.updateTargetElement();
                }
                break;
            case 'mouseup':
                if (me.dragId != -1) {
                    me.dragId = -1;
                    me.updateTargetElement();
                    var $target = me.data('$scaleTarget');
                    if ($target.parent()) me.attachTo(me.data('$scaleTarget'));
                }
                $doc.unbind('mousemove', $.proxy(me._eventHandler, me));
                break;
            default:
                break;
        }
    },
    updateTargetElement: function () {
        var me = this,
            $root = me.root(),
            $target = me.data('$scaleTarget');
        $target.css({width: $root.width(), height: $root.height()});
        me.attachTo($target);
    },
    updateContainerStyle: function (dir, offset) {
        var me = this,
            $dom = me.root(),
            tmp,
            rect = [
                //[left, top, width, height]
                [0, 0, -1, -1],
                [0, 0, 0, -1],
                [0, 0, 1, -1],
                [0, 0, -1, 0],
                [0, 0, 1, 0],
                [0, 0, -1, 1],
                [0, 0, 0, 1],
                [0, 0, 1, 1]
            ];

        if (rect[dir][0] != 0) {
            tmp = parseInt($dom.offset().left) + offset.x;
            $dom.css('left', me._validScaledProp('left', tmp));
        }
        if (rect[dir][1] != 0) {
            tmp = parseInt($dom.offset().top) + offset.y;
            $dom.css('top', me._validScaledProp('top', tmp));
        }
        if (rect[dir][2] != 0) {
            tmp = $dom.width() + rect[dir][2] * offset.x;
            $dom.css('width', me._validScaledProp('width', tmp));
        }
        if (rect[dir][3] != 0) {
            tmp = $dom.height() + rect[dir][3] * offset.y;
            $dom.css('height', me._validScaledProp('height', tmp));
        }
    },
    _validScaledProp: function (prop, value) {
        var $ele = this.root(),
            $wrap = this.defaultOpt.$doc,
            calc = function(val, a, b){
                return (val + a) > b ? b - a : value;
            };

        value = isNaN(value) ? 0 : value;
        switch (prop) {
            case 'left':
                return value < 0 ? 0 : calc(value, $ele.width(), $wrap.width());
            case 'top':
                return value < 0 ? 0 : calc(value, $ele.height(),$wrap.height());
            case 'width':
                return value <= 0 ? 1 : calc(value, $ele.offset().left, $wrap.width());
            case 'height':
                return value <= 0 ? 1 : calc(value, $ele.offset().top, $wrap.height());
        }
    },
    show: function ($obj) {
        var me = this;
        if ($obj) me.attachTo($obj);
        me.root().bind('mousedown', $.proxy(me._eventHandler, me));
        me.defaultOpt.$doc.bind('mouseup', $.proxy(me._eventHandler, me));
        me.root().show();
        me.trigger("aftershow");
    },
    hide: function () {
        var me = this;
        me.root().unbind('mousedown', $.proxy(me._eventHandler, me));
        me.defaultOpt.$doc.unbind('mouseup', $.proxy(me._eventHandler, me));
        me.root().hide();
        me.trigger('afterhide')
    },
    attachTo: function ($obj) {
        var me = this,
            imgPos = $obj.offset(),
            $root = me.root(),
            $wrap = me.defaultOpt.$wrap,
            posObj = $wrap.offset();

        me.data('$scaleTarget', $obj);
        me.root().css({
            position: 'absolute',
            width: $obj.width(),
            height: $obj.height(),
            left: imgPos.left - posObj.left - parseInt($wrap.css('border-left-width')) - parseInt($root.css('border-left-width')),
            top: imgPos.top - posObj.top - parseInt($wrap.css('border-top-width')) - parseInt($root.css('border-top-width'))
        });
    },
    getScaleTarget: function () {
        return this.data('$scaleTarget')[0];
    }
});

//colorpicker 类
KM.ui.define('colorpicker', {
    tpl: function (opt) {
        var COLORS = (
            'ffffff,000000,eeece1,1f497d,4f81bd,c0504d,9bbb59,8064a2,4bacc6,f79646,' +
                'f2f2f2,7f7f7f,ddd9c3,c6d9f0,dbe5f1,f2dcdb,ebf1dd,e5e0ec,dbeef3,fdeada,' +
                'd8d8d8,595959,c4bd97,8db3e2,b8cce4,e5b9b7,d7e3bc,ccc1d9,b7dde8,fbd5b5,' +
                'bfbfbf,3f3f3f,938953,548dd4,95b3d7,d99694,c3d69b,b2a2c7,92cddc,fac08f,' +
                'a5a5a5,262626,494429,17365d,366092,953734,76923c,5f497a,31859b,e36c09,' +
                '7f7f7f,0c0c0c,1d1b10,0f243e,244061,632423,4f6128,3f3151,205867,974806,' +
                'c00000,ff0000,ffc000,ffff00,92d050,00b050,00b0f0,0070c0,002060,7030a0,').split(',');

        var html = '<div unselectable="on" onmousedown="return false" class="kmui-colorpicker<%if (name){%> kmui-colorpicker-<%=name%><%}%>" >' +
            '<table unselectable="on" onmousedown="return false">' +
            '<tr><td colspan="10">'+opt.lang_themeColor+'</td> </tr>' +
            '<tr class="kmui-colorpicker-firstrow" >';

        for (var i = 0; i < COLORS.length; i++) {
            if (i && i % 10 === 0) {
                html += '</tr>' + (i == 60 ? '<tr><td colspan="10">'+opt.lang_standardColor+'</td></tr>' : '') + '<tr' + (i == 60 ? ' class="kmui-colorpicker-firstrow"' : '') + '>';
            }
            html += i < 70 ? '<td><a unselectable="on" onmousedown="return false" title="' + COLORS[i] + '" class="kmui-colorpicker-colorcell"' +
                ' data-color="#' + COLORS[i] + '"' +
                ' style="background-color:#' + COLORS[i] + ';border:solid #ccc;' +
                (i < 10 || i >= 60 ? 'border-width:1px;' :
                    i >= 10 && i < 20 ? 'border-width:1px 1px 0 1px;' :
                        'border-width:0 1px 0 1px;') +
                '"' +
                '></a></td>' : '';
        }
        html += '</tr></table></div>';
        return html;
    },
    init: function (options) {
        var me = this;
        me.root($($.parseTmpl(me.supper.mergeTpl(me.tpl(options)),options)));

        me.root().on("click",function (e) {
            me.trigger('pickcolor',  $(e.target).data('color'));
        });
    }
}, 'popup');

/**
 * Created with JetBrains PhpStorm.
 * User: hn
 * Date: 13-5-29
 * Time: 下午8:01
 * To change this template use File | Settings | File Templates.
 */

(function(){

    var widgetName = 'combobox',
        itemClassName = 'kmui-combobox-item',
        HOVER_CLASS = 'kmui-combobox-item-hover',
        ICON_CLASS = 'kmui-combobox-checked-icon',
        labelClassName = 'kmui-combobox-item-label';

    KM.ui.define( widgetName, ( function(){

        return {
            tpl: "<ul class=\"dropdown-menu kmui-combobox-menu<%if (comboboxName!=='') {%> kmui-combobox-<%=comboboxName%><%}%>\" unselectable=\"on\" onmousedown=\"return false\" role=\"menu\" aria-labelledby=\"dropdownMenu\">" +
                "<%if(autoRecord) {%>" +
                "<%for( var i=0, len = recordStack.length; i<len; i++ ) {%>" +
                "<%var index = recordStack[i];%>" +
                "<li class=\"<%=itemClassName%><%if( selected == index ) {%> kmui-combobox-checked<%}%>\" data-item-index=\"<%=index%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ index ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=items[index]%></label>" +
                "</li>" +
                "<%}%>" +
                "<%if( i ) {%>" +
                "<li class=\"kmui-combobox-item-separator\"></li>" +
                "<%}%>" +
                "<%}%>" +
                "<%for( var i=0, label; label = items[i]; i++ ) {%>" +
                "<li class=\"<%=itemClassName%><%if( selected == i ) {%> kmui-combobox-checked<%}%> kmui-combobox-item-<%=i%>\" data-item-index=\"<%=i%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ i ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=label%></label>" +
                "</li>" +
                "<%}%>" +
                "</ul>",
            defaultOpt: {
                //记录栈初始列表
                recordStack: [],
                //可用项列表
                items: [],
		        //item对应的值列表
                value: [],
                comboboxName: '',
                selected: '',
                //自动记录
                autoRecord: true,
                //最多记录条数
                recordCount: 5
            },
            init: function( options ){

                var me = this;

                $.extend( me._optionAdaptation( options ), me._createItemMapping( options.recordStack, options.items ), {
                    itemClassName: itemClassName,
                    iconClass: ICON_CLASS,
                    labelClassName: labelClassName
                } );

                this._transStack( options );

                me.root( $( $.parseTmpl( me.tpl, options ) ) );

                this.data( 'options', options ).initEvent();

            },
            initEvent: function(){

                var me = this;

                me.initSelectItem();

                this.initItemActive();

            },
            setLabelWithDefaultValue : function(){
                var $btn = this.data('button');
                $btn.kmui().label($btn.data('original-title'))
            },
            /**
             * 初始化选择项
             */
            initSelectItem: function(){

                var me = this,
                    labelClass = "."+labelClassName;

                me.root().delegate('.' + itemClassName, 'click', function(){

                    var $li = $(this),
                        index = $li.attr('data-item-index');

                    me.trigger('comboboxselect', {
                        index: index,
                        label: $li.find(labelClass).text(),
                        value: me.data('options').value[ index ]
                    }).select( index );

                    me.hide();
                    me.trigger('aftercomboboxselect');
                    return false;

                });

            },
            initItemActive: function(){
                var fn = {
                    mouseenter: 'addClass',
                    mouseleave: 'removeClass'
                };
                if ($.IE6) {
                    this.root().delegate( '.'+itemClassName,  'mouseenter mouseleave', function( evt ){
                        $(this)[ fn[ evt.type ] ]( HOVER_CLASS );
                    }).one('afterhide', function(){
                    });
                }
            },
            /**
             * 选择给定索引的项
             * @param index 项索引
             * @returns {*} 如果存在对应索引的项，则返回该项；否则返回null
             */
            select: function( index ){

                var itemCount = this.data('options').itemCount,
                    items = this.data('options').autowidthitem;

                if ( items && !items.length ) {
                    items = this.data('options').items;
                }

                if( itemCount == 0 ) {
                    return null;
                }

                if( index < 0 ) {

                    index = itemCount + index % itemCount;

                } else if ( index >= itemCount ) {

                    index = itemCount-1;

                }

                this.trigger( 'changebefore', items[ index ] );

                this._update( index );

                this.trigger( 'changeafter', items[ index ] );

                return null;

            },
            selectItemByLabel: function( label ){

                var itemMapping = this.data('options').itemMapping,
                    me = this,
                    index = null;

                !$.isArray( label ) && ( label = [ label ] );

                $.each( label, function( i, item ){

                    index = itemMapping[ item ];

                    if( index !== undefined ) {

                        me.select( index );
                        return false;

                    }

                } );

            },
            /**
             * 转换记录栈
             */
            _transStack: function( options ) {

                var temp = [],
                    itemIndex = -1,
                    selected = -1;

                $.each( options.recordStack, function( index, item ){

                    itemIndex = options.itemMapping[ item ];

                    if( $.isNumeric( itemIndex ) ) {

                        temp.push( itemIndex );

                        //selected的合法性检测
                        if( item == options.selected ) {
                            selected = itemIndex;
                        }

                    }

                } );

                options.recordStack = temp;
                options.selected = selected;
                temp = null;

            },
            _optionAdaptation: function( options ) {

                if( !( 'itemStyles' in options ) ) {

                    options.itemStyles = [];

                    for( var i = 0, len = options.items.length; i < len; i++ ) {
                        options.itemStyles.push('');
                    }

                }

                options.autowidthitem = options.autowidthitem || options.items;
                options.itemCount = options.items.length;

                return options;

            },
            _createItemMapping: function( stackItem, items ){

                var temp = {},
                    result = {
                        recordStack: [],
                        mapping: {}
                    };

                $.each( items, function( index, item ){
                    temp[ item ] = index;
                } );

                result.itemMapping = temp;

                $.each( stackItem, function( index, item ){

                    if( temp[ item ] !== undefined ) {
                        result.recordStack.push( temp[ item ] );
                        result.mapping[ item ] = temp[ item ];
                    }

                } );

                return result;

            },
            _update: function ( index ) {

                var options = this.data("options"),
                    newStack = [],
                    newChilds = null;

                $.each( options.recordStack, function( i, item ){

                    if( item != index ) {
                        newStack.push( item );
                    }

                } );

                //压入最新的记录
                newStack.unshift( index );

                if( newStack.length > options.recordCount ) {
                    newStack.length = options.recordCount;
                }

                options.recordStack = newStack;
                options.selected = index;

                newChilds = $( $.parseTmpl( this.tpl, options ) );

                //重新渲染
                this.root().html( newChilds.html() );

                newChilds = null;
                newStack = null;

            }
        };

    } )(), 'menu' );

})();


/**
 * Combox 抽象基类
 * User: hn
 * Date: 13-5-29
 * Time: 下午8:01
 * To change this template use File | Settings | File Templates.
 */

(function(){

    var widgetName = 'buttoncombobox';

    KM.ui.define( widgetName, ( function(){

        return {
            defaultOpt: {
                //按钮初始文字
                label: '',
                title: ''
            },
            init: function( options ) {

                var me = this;

                var btnWidget = $.kmuibutton({
                    caret: true,
                    name: options.comboboxName,
                    title: options.title,
                    text: options.label,
                    click: function(){
                        me.show( this.root() );
                    }
                });

                me.supper.init.call( me, options );

                //监听change， 改变button显示内容
                me.on('changebefore', function( e, label ){
                    btnWidget.kmuibutton('label', label );
                });

                me.data( 'button', btnWidget );

                me.attachTo(btnWidget)

            },
            button: function(){
                return this.data( 'button' );
            }
        }

    } )(), 'combobox' );

})();


/*modal 类*/
KM.ui.define('modal', {
    tpl: '<div class="kmui-modal" tabindex="-1" >' +
        '<div class="kmui-modal-header">' +
        '<div class="kmui-close" data-hide="modal"></div>' +
        '<h3 class="kmui-title"><%=title%></h3>' +
        '</div>' +
        '<div class="kmui-modal-body"  style="<%if(width){%>width:<%=width%>px;<%}%>' +
        '<%if(height){%>height:<%=height%>px;<%}%>">' +
        ' </div>' +
        '<% if(cancellabel || oklabel) {%>' +
        '<div class="kmui-modal-footer">' +
        '<div class="kmui-modal-tip"></div>' +
        '<%if(oklabel){%><div class="kmui-btn kmui-btn-primary" data-ok="modal"><%=oklabel%></div><%}%>' +
        '<%if(cancellabel){%><div class="kmui-btn" data-hide="modal"><%=cancellabel%></div><%}%>' +
        '</div>' +
        '<%}%></div>',
    defaultOpt: {
        title: "",
        cancellabel: "",
        oklabel: "",
        width: '',
        height: '',
        backdrop: true,
        keyboard: true
    },
    init: function (options) {
        var me = this;

        me.root($($.parseTmpl(me.tpl, options || {})));

        me.data("options", options);
        if (options.okFn) {
            me.on('ok', $.proxy(options.okFn, me))
        }
        if (options.cancelFn) {
            me.on('beforehide', $.proxy(options.cancelFn, me))
        }

        me.root().delegate('[data-hide="modal"]', 'click', $.proxy(me.hide, me))
            .delegate('[data-ok="modal"]', 'click', $.proxy(me.ok, me));

        $('[data-hide="modal"],[data-ok="modal"]',me.root()).hover(function(){
            $(this).toggleClass('kmui-hover')
        });
    },
    toggle: function () {
        var me = this;
        return me[!me.data("isShown") ? 'show' : 'hide']();
    },
    show: function () {

        var me = this;

        me.trigger("beforeshow");

        if (me.data("isShown")) return;

        me.data("isShown", true);

        me.escape();

        me.backdrop(function () {
            me.autoCenter();
            me.root()
                .show()
                .focus()
                .trigger('aftershow');
        })
    },
    showTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).html( text ).fadeIn();
    },
    hideTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).fadeOut( function (){
            $(this).html('');
        } );
    },
    autoCenter: function () {
        //ie6下不用处理了
        !$.IE6 && this.root().css("margin-left", -(this.root().width() / 2));
    },
    hide: function () {
        var me = this;

        me.trigger("beforehide");

        if (!me.data("isShown")) return;

        me.data("isShown", false);

        me.escape();

        me.hideModal();
    },
    escape: function () {
        var me = this;
        if (me.data("isShown") && me.data("options").keyboard) {
            me.root().on('keyup', function (e) {
                e.which == 27 && me.hide();
            })
        }
        else if (!me.data("isShown")) {
            me.root().off('keyup');
        }
    },
    hideModal: function () {
        var me = this;
        me.root().hide();
        me.backdrop(function () {
            me.removeBackdrop();
            me.trigger('afterhide');
        })
    },
    removeBackdrop: function () {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    },
    backdrop: function (callback) {
        var me = this;
        if (me.data("isShown") && me.data("options").backdrop) {
            me.$backdrop = $('<div class="kmui-modal-backdrop" />').click(
                me.data("options").backdrop == 'static' ?
                    $.proxy(me.root()[0].focus, me.root()[0])
                    : $.proxy(me.hide, me)
            )
        }
        me.trigger('afterbackdrop');
        callback && callback();

    },
    attachTo: function ($obj) {
        var me = this
        if (!$obj.data('$mergeObj')) {

            $obj.data('$mergeObj', me.root());
            $obj.on('click', function () {
                me.toggle($obj)
            });
            me.data('$mergeObj', $obj)
        }
    },
    ok: function () {
        var me = this;
        me.trigger('beforeok');
        if (me.trigger("ok", me) === false) {
            return;
        }
        me.hide();
    },
    getBodyContainer: function () {
        return this.root().find('.kmui-modal-body')
    }
});



/*tooltip 类*/
KM.ui.define('tooltip', {
    tpl: '<div class="kmui-tooltip" unselectable="on" onmousedown="return false"><div class="kmui-tooltip-arrow" unselectable="on" onmousedown="return false"></div><div class="kmui-tooltip-inner" unselectable="on" onmousedown="return false"></div></div>',
    init: function (options) {
        var me = this;
        me.root($($.parseTmpl(me.tpl, options || {})));
    },
    content: function (e) {
        var me = this,
            title = $(e.currentTarget).attr("data-original-title");

        me.root().find('.kmui-tooltip-inner')['text'](title);
    },
    position: function (e) {
        var me = this,
            $obj = $(e.currentTarget);

        me.root().css($.extend({display: 'block'}, $obj ? {
            top: $obj.outerHeight(),
            left: (($obj.outerWidth() - me.root().outerWidth()) / 2)
        } : {}))
    },
    show: function (e) {
        if ($(e.currentTarget).hasClass('kmui-disabled')) return;

        var me = this;
        me.content(e);
        me.root().appendTo($(e.currentTarget));
        me.position(e);
        me.root().css('display', 'block');
    },
    hide: function () {
        var me = this;
        me.root().css('display', 'none')
    },
    attachTo: function ($obj) {
        var me = this;

        function tmp($obj) {
            var me = this;

            if (!$.contains(document.body, me.root()[0])) {
                me.root().appendTo($obj);
            }

            me.data('tooltip', me.root());

            $obj.each(function () {
                if ($(this).attr("data-original-title")) {
                    $(this).on('mouseenter', $.proxy(me.show, me))
                        .on('mouseleave click', $.proxy(me.hide, me))

                }
            });

        }

        if ($.type($obj) === "undefined") {
            $("[data-original-title]").each(function (i, el) {
                tmp.call(me, $(el));
            })

        } else {
            if (!$obj.data('tooltip')) {
                tmp.call(me, $obj);
            }
        }
    }
});


/*tab 类*/
KM.ui.define('tab', {
    init: function (options) {
        var me = this,
            slr = options.selector;

        if ($.type(slr)) {
            me.root($(slr, options.context));
            me.data("context", options.context);

            $(slr, me.data("context")).on('click', function (e) {
                me.show(e);
            });
        }
    },
    show: function (e) {

        var me = this,
            $cur = $(e.target),
            $ul = $cur.closest('ul'),
            selector,
            previous,
            $target,
            e;

        selector = $cur.attr('data-context');
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');

        var $tmp = $cur.parent('li');

        if (!$tmp.length || $tmp.hasClass('kmui-active')) return;

        previous = $ul.find('.kmui-active:last a')[0];

        e = $.Event('beforeshow', {
            target: $cur[0],
            relatedTarget: previous
        });

        me.trigger(e);

        if (e.isDefaultPrevented()) return;

        $target = $(selector, me.data("context"));

        me.activate($cur.parent('li'), $ul);
        me.activate($target, $target.parent(), function () {
            me.trigger({
                type: 'aftershow', relatedTarget: previous
            })
        });
    },
    activate: function (element, container, callback) {
        if (element === undefined) {
            return $(".kmui-tab-item.kmui-active",this.root()).index();
        }

        var $active = container.find('> .kmui-active');

        $active.removeClass('kmui-active');

        element.addClass('kmui-active');

        callback && callback();
    }
});



//button 类
KM.ui.define('separator', {
    tpl: '<div class="kmui-separator" unselectable="on" onmousedown="return false" ></div>',
    init: function (options) {
        var me = this;
        me.root($($.parseTmpl(me.tpl, options)));
        return me;
    }
});

//scale 类
KM.ui.define('scale', {
    tpl: '<div class="kmui-scale" unselectable="on">' +
        '<span class="kmui-scale-hand0"></span>' +
        '<span class="kmui-scale-hand1"></span>' +
        '<span class="kmui-scale-hand2"></span>' +
        '<span class="kmui-scale-hand3"></span>' +
        '<span class="kmui-scale-hand4"></span>' +
        '<span class="kmui-scale-hand5"></span>' +
        '<span class="kmui-scale-hand6"></span>' +
        '<span class="kmui-scale-hand7"></span>' +
        '</div>',
    defaultOpt: {
        $doc: $(document),
        $wrap: $(document)
    },
    init: function (options) {
        if(options.$doc) this.defaultOpt.$doc = options.$doc;
        if(options.$wrap) this.defaultOpt.$wrap = options.$wrap;
        this.root($($.parseTmpl(this.tpl, options)));
        this.initStyle();
        this.startPos = this.prePos = {x: 0, y: 0};
        this.dragId = -1;
        return this;
    },
    initStyle: function () {
        utils.cssRule('kmui-style-scale', '.kmui-scale{display:none;position:absolute;border:1px solid #38B2CE;cursor:hand;}' +
            '.kmui-scale span{position:absolute;left:0;top:0;width:7px;height:7px;overflow:hidden;font-size:0px;display:block;background-color:#3C9DD0;}'
            + '.kmui-scale .kmui-scale-hand0{cursor:nw-resize;top:0;margin-top:-4px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand1{cursor:n-resize;top:0;margin-top:-4px;left:50%;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand2{cursor:ne-resize;top:0;margin-top:-4px;left:100%;margin-left:-3px;}'
            + '.kmui-scale .kmui-scale-hand3{cursor:w-resize;top:50%;margin-top:-4px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand4{cursor:e-resize;top:50%;margin-top:-4px;left:100%;margin-left:-3px;}'
            + '.kmui-scale .kmui-scale-hand5{cursor:sw-resize;top:100%;margin-top:-3px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand6{cursor:s-resize;top:100%;margin-top:-3px;left:50%;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand7{cursor:se-resize;top:100%;margin-top:-3px;left:100%;margin-left:-3px;}');
    },
    _eventHandler: function (e) {
        var me = this,
            $doc = me.defaultOpt.$doc;
        switch (e.type) {
            case 'mousedown':
                var hand = e.target || e.srcElement, hand;
                if (hand.className.indexOf('kmui-scale-hand') != -1) {
                    me.dragId = hand.className.slice(-1);
                    me.startPos.x = me.prePos.x = e.clientX;
                    me.startPos.y = me.prePos.y = e.clientY;
                    $doc.bind('mousemove', $.proxy(me._eventHandler, me));
                }
                break;
            case 'mousemove':
                if (me.dragId != -1) {
                    me.updateContainerStyle(me.dragId, {x: e.clientX - me.prePos.x, y: e.clientY - me.prePos.y});
                    me.prePos.x = e.clientX;
                    me.prePos.y = e.clientY;
                    me.updateTargetElement();
                }
                break;
            case 'mouseup':
                if (me.dragId != -1) {
                    me.dragId = -1;
                    me.updateTargetElement();
                    var $target = me.data('$scaleTarget');
                    if ($target.parent()) me.attachTo(me.data('$scaleTarget'));
                }
                $doc.unbind('mousemove', $.proxy(me._eventHandler, me));
                break;
            default:
                break;
        }
    },
    updateTargetElement: function () {
        var me = this,
            $root = me.root(),
            $target = me.data('$scaleTarget');
        $target.css({width: $root.width(), height: $root.height()});
        me.attachTo($target);
    },
    updateContainerStyle: function (dir, offset) {
        var me = this,
            $dom = me.root(),
            tmp,
            rect = [
                //[left, top, width, height]
                [0, 0, -1, -1],
                [0, 0, 0, -1],
                [0, 0, 1, -1],
                [0, 0, -1, 0],
                [0, 0, 1, 0],
                [0, 0, -1, 1],
                [0, 0, 0, 1],
                [0, 0, 1, 1]
            ];

        if (rect[dir][0] != 0) {
            tmp = parseInt($dom.offset().left) + offset.x;
            $dom.css('left', me._validScaledProp('left', tmp));
        }
        if (rect[dir][1] != 0) {
            tmp = parseInt($dom.offset().top) + offset.y;
            $dom.css('top', me._validScaledProp('top', tmp));
        }
        if (rect[dir][2] != 0) {
            tmp = $dom.width() + rect[dir][2] * offset.x;
            $dom.css('width', me._validScaledProp('width', tmp));
        }
        if (rect[dir][3] != 0) {
            tmp = $dom.height() + rect[dir][3] * offset.y;
            $dom.css('height', me._validScaledProp('height', tmp));
        }
    },
    _validScaledProp: function (prop, value) {
        var $ele = this.root(),
            $wrap = this.defaultOpt.$doc,
            calc = function(val, a, b){
                return (val + a) > b ? b - a : value;
            };

        value = isNaN(value) ? 0 : value;
        switch (prop) {
            case 'left':
                return value < 0 ? 0 : calc(value, $ele.width(), $wrap.width());
            case 'top':
                return value < 0 ? 0 : calc(value, $ele.height(),$wrap.height());
            case 'width':
                return value <= 0 ? 1 : calc(value, $ele.offset().left, $wrap.width());
            case 'height':
                return value <= 0 ? 1 : calc(value, $ele.offset().top, $wrap.height());
        }
    },
    show: function ($obj) {
        var me = this;
        if ($obj) me.attachTo($obj);
        me.root().bind('mousedown', $.proxy(me._eventHandler, me));
        me.defaultOpt.$doc.bind('mouseup', $.proxy(me._eventHandler, me));
        me.root().show();
        me.trigger("aftershow");
    },
    hide: function () {
        var me = this;
        me.root().unbind('mousedown', $.proxy(me._eventHandler, me));
        me.defaultOpt.$doc.unbind('mouseup', $.proxy(me._eventHandler, me));
        me.root().hide();
        me.trigger('afterhide')
    },
    attachTo: function ($obj) {
        var me = this,
            imgPos = $obj.offset(),
            $root = me.root(),
            $wrap = me.defaultOpt.$wrap,
            posObj = $wrap.offset();

        me.data('$scaleTarget', $obj);
        me.root().css({
            position: 'absolute',
            width: $obj.width(),
            height: $obj.height(),
            left: imgPos.left - posObj.left - parseInt($wrap.css('border-left-width')) - parseInt($root.css('border-left-width')),
            top: imgPos.top - posObj.top - parseInt($wrap.css('border-top-width')) - parseInt($root.css('border-top-width'))
        });
    },
    getScaleTarget: function () {
        return this.data('$scaleTarget')[0];
    }
});

/**
 * 宽度自适应工具函数
 * @param word 单词内容
 * @param hasSuffix 是否含有后缀
 */
$.wordCountAdaptive  = function( word, hasSuffix ) {

    var $tmpNode = $('<span>' ).html( word ).css( {
            display: 'inline',
            position: 'absolute',
            top: -10000000,
            left: -100000
        } ).appendTo( document.body),
        width = $tmpNode.width();

    $tmpNode.remove();
    $tmpNode = null;

    if( width < 50 ) {

        return word;

    } else {

        word = word.slice( 0, hasSuffix ? -4 : -1 );

        if( !word.length ) {
            return '...';
        }

        return $.wordCountAdaptive( word + '...', true );

    }
};

utils.extend( KityMinder, function () {
    var _kityminderUI = {},
        _activeWidget = null,
        _widgetData = {},
        _widgetCallBack = {};
    return {
        registerUI: function ( uiname, fn ) {
            utils.each( uiname.split( /\s+/ ), function ( i, name ) {
                _kityminderUI[ name ] = fn;
            } )
        },
        _createUI: function ( id ) {
            var $cont = $( '<div class="kmui-container"></div>' ),
                $toolbar = $.kmuitoolbar(),
                $kmbody = $( '<div class="kmui-editor-body"></div>' ),
                $statusbar = $( '<div class="kmui-statusbar"></div>' );

            $cont.append( $toolbar ).append( $kmbody ).append( $statusbar );
            $( utils.isString( id ) ? '#' + id : id ).append( $cont );
            return {
                '$container': $cont,
                '$toolbar': $toolbar,
                '$body': $kmbody,
                '$statusbar': $statusbar
            };
        },
        _createToolbar: function ( $toolbar, km ) {
            var toolbars = km.getOptions( 'toolbars' );
            if ( toolbars && toolbars.length ) {
                var btns = [];
                $.each( toolbars, function ( i, uiNames ) {
                    $.each( uiNames.split( /\s+/ ), function ( index, name ) {
                        if ( name == '|' ) {
                            $.kmuiseparator && btns.push( $.kmuiseparator() );
                        } else {
                            if ( _kityminderUI[ name ] ) {
                                var ui = _kityminderUI[ name ].call( km, name );
                                ui && btns.push( ui );
                            }

                        }

                    } );
                    btns.length && $toolbar.kmui().appendToBtnmenu( btns );
                } );
            }
            $toolbar.append( $( '<div class="kmui-dialog-container"></div>' ) );
        },
        _createStatusbar: function ( $statusbar, km ) {

        },
        getKityMinder: function ( id, options ) {
            var containers = this._createUI( id );
            var km = this.getMinder( containers.$body.get( 0 ), options );
            this._createToolbar( containers.$toolbar, km );
            this._createStatusbar( containers.$statusbar, km );
            km.$container = containers.$container;
            return km.fire( 'interactchange' );
        },
        registerWidget: function ( name, pro, cb ) {
            _widgetData[ name ] = $.extend2( pro, {
                $root: '',
                _preventDefault: false,
                root: function ( $el ) {
                    return this.$root || ( this.$root = $el );
                },
                preventDefault: function () {
                    this._preventDefault = true;
                },
                clear: false
            } );
            if ( cb ) {
                _widgetCallBack[ name ] = cb;
            }
        },
        getWidgetData: function ( name ) {
            return _widgetData[ name ]
        },
        setWidgetBody: function ( name, $widget, km ) {
            if ( !km._widgetData ) {

                utils.extend( km, {
                    _widgetData: {},
                    getWidgetData: function ( name ) {
                        return this._widgetData[ name ];
                    },
                    getWidgetCallback: function ( widgetName ) {
                        var me = this;
                        return function () {
                            return _widgetCallBack[ widgetName ].apply( me, [ me, $widget ].concat( utils.argsToArray( arguments, 0 ) ) )
                        }
                    }
                } )

            }
            var pro = _widgetData[ name ];
            if ( !pro ) {
                return null;
            }
            pro = km._widgetData[ name ];
            if ( !pro ) {
                pro = _widgetData[ name ];
                pro = km._widgetData[ name ] = $.type( pro ) == 'function' ? pro : utils.clone( pro );
            }

            pro.root( $widget.kmui().getBodyContainer() );

            pro.initContent( km, $widget );
            if ( !pro._preventDefault ) {
                pro.initEvent( km, $widget );
            }

            pro.width && $widget.width( pro.width );
        },
        setActiveWidget: function ( $widget ) {
            _activeWidget = $widget;
        }
    }
}() );

KM.registerUI('bold italic redo undo',
    function(name) {
        var me = this;
        var $btn = $.kmuibutton({
            icon : name,
            click : function(){
                me.execCommand(name);
            },
            title: this.getLang('tooltips')[name] || ''
        });
        this.on('interactchange',function(){
            var state = this.queryCommandState(name);
            $btn.kmui().disabled(state == -1).active(state == 1)
        });
        return $btn;
    }
);



KM.registerUI( 'layoutstyle fontfamily fontsize', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions( name ) || [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null,
        comboboxWidget = null;

    if ( options.items.length == 0 ) {
        return null;
    }
    switch ( name ) {

    case 'layoutstyle':
        options = transForLayoutstyle( options );
        break;

    case 'fontfamily':
        options = transForFontfamily( options );
        break;

    case 'fontsize':
        options = transForFontsize( options );
        break;

    }

    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand( name, res.value );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } );


    //状态反射
    this.on( 'interactchange', function () {
        var state = this.queryCommandState( name ),
            value = this.queryCommandValue( name );
        //设置按钮状态
        comboboxWidget.button().kmui().disabled( state == -1 ).active( state == 1 );

        if ( value ) {
            //设置label
            value = value.replace( /['"]/g, '' ).toLowerCase().split( /['|"]?\s*,\s*[\1]?/ );
            comboboxWidget.selectItemByLabel( value );
        }
    } );

    return comboboxWidget.button().addClass( 'kmui-combobox' );



    function transForLayoutstyle( options ) {

        var tempItems = [];

        utils.each( options.items, function ( k, v ) {
            options.value.push( k );
            tempItems.push( k );
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ tempItems.length - 1 ] ) );
        } );

        options.items = tempItems;

        return options;

    }

    //字体参数转换
    function transForFontfamily( options ) {

        var temp = null,
            tempItems = [];

        for ( var i = 0, len = options.items.length; i < len; i++ ) {

            temp = options.items[ i ].val;
            tempItems.push( temp.split( /\s*,\s*/ )[ 0 ] );
            options.itemStyles.push( 'font-family: ' + temp );
            options.value.push( temp );
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ i ] ) );

        }

        options.items = tempItems;

        return options;

    }

    //字体大小参数转换
    function transForFontsize( options ) {

        var temp = null,
            tempItems = [];

        options.itemStyles = [];
        options.value = [];

        for ( var i = 0, len = options.items.length; i < len; i++ ) {

            temp = options.items[ i ];
            tempItems.push( temp );
            options.itemStyles.push( 'font-size: ' + temp + 'px' );

        }

        options.value = options.items;
        options.items = tempItems;
        options.autoRecord = false;

        return options;

    }

} );


KM.registerUI( 'forecolor', function ( name ) {
    function getCurrentColor() {
        return $colorLabel.css( 'background-color' );
    }

    var me = this,
        $colorPickerWidget = null,
        $colorLabel = null,
        $btn = null;

    this.on( 'interactchange', function () {
        var state = this.queryCommandState( name );
        $btn.kmui().disabled( state == -1 ).active( state == 1 );
    } );

    $btn = $.kmuicolorsplitbutton( {
        icon: name,
        caret: true,
        name: name,
        title: this.getLang( 'tooltips' )[ name ] || '',
        click: function () {
            var color =   kity.Color.parse(getCurrentColor()).toHEX();
            if(!color == '#000000'){
                me.execCommand( name, color );
            }
        }
    } );

    $colorLabel = $btn.kmui().colorLabel();

    $colorPickerWidget = $.kmuicolorpicker( {
        name: name,
        lang_clearColor: me.getLang( 'popupcolor' )[ 'clearColor' ] || '',
        lang_themeColor: me.getLang( 'popupcolor' )[ 'themeColor' ] || '',
        lang_standardColor: me.getLang( 'popupcolor' )[ 'standardColor' ] || ''
    } ).on( 'pickcolor', function ( evt, color ) {
        window.setTimeout( function () {
            $colorLabel.css( "backgroundColor", color );
            me.execCommand( name, color );
        }, 0 );
    } ).on( 'show', function () {
        KM.setActiveWidget( $colorPickerWidget.kmui().root() );
    } ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );

    $btn.kmui().on( 'arrowclick', function () {
        if ( !$colorPickerWidget.parent().length ) {
            me.$container.find( '.kmui-dialog-container' ).append( $colorPickerWidget );
        }
        $colorPickerWidget.kmui().show( $btn, {
            caretDir: "down",
            offsetTop: -5,
            offsetLeft: 8,
            caretLeft: 11,
            caretTop: -8
        } );
    } ).register( 'click', $btn, function () {
        $colorPickerWidget.kmui().hide()
    } );

    return $btn;

} );

KM.registerUI( 'saveto', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null,
        comboboxWidget = null;

    var downloadLink = document.createElement( 'a' );

    utils.each( KityMinder.getAllRegisteredProtocals(), function ( k ) {
        var p = KityMinder.findProtocal( k );
        var text = p.fileDescription + '（' + p.fileExtension + '）';
        options.value.push( k );
        options.items.push( text );
        options.autowidthitem.push( $.wordCountAdaptive( text ), true );
    } );


    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        var data = me.exportData( res.value );
        var p = KityMinder.findProtocal( res.value );
        var a = downloadLink;
        a.setAttribute( 'download', 'MyMind' + p.fileExtension );
        a.setAttribute( 'href', 'data:text/plain; utf-8,' + encodeURI( data ) );
        a.dispatchEvent( new MouseEvent( 'click' ) );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } ).on( 'aftercomboboxselect', function () {
        this.setLabelWithDefaultValue();
    } );



    return comboboxWidget.button().addClass( 'kmui-combobox' );

} );

KM.registerUI( 'hand',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: function ( e ) {
                var drag = me._onDragMode = !me._onDragMode;
                me._paper.setStyle( 'cursor', drag ? 'pointer' : 'default' );
                me._paper.setStyle( 'cursor', drag ? '-webkit-grab' : 'default' );
                $btn.kmui().active( drag );
                if ( drag ) {
                    me._paper.drag();
                } else {
                    me._paper.undrag();
                }
            },
            title: this.getLang( 'hand' )[ name ] || ''
        } );
        me.on( 'beforemousemove', function ( e ) {
            if ( this._onDragMode ) {
                e.stopPropagation();
            }
        } );
        kity.extendClass( kity.Paper, kity.Draggable );
        return $btn;
    }
);

KityMinder.registerProtocal( "plain", function () {
	var LINE_ENDING = '\n',
		TAB_CHAR = '\t';

	function repeat( s, n ) {
		var result = "";
		while ( n-- ) result += s;
		return result;
	}

	function encode( json, level ) {
		var local = "";
		level = level || 0;
		local += repeat( TAB_CHAR, level );
		local += json.data.text + LINE_ENDING;
		if ( json.children ) {
			json.children.forEach( function ( child ) {
				local += encode( child, level + 1 );
			} );
		}
		return local;
	}

	function isEmpty( line ) {
		return !/\S/.test( line );
	}

	function getLevel( line ) {
		var level = 0;
		while ( line.charAt( level ) === TAB_CHAR ) level++;
		return level;
	}

	function getNode( line ) {
		return {
			data: {
				text: line.replace( new RegExp( '^' + TAB_CHAR + '*' ), '' )
			}
		};
	}

	function decode( local ) {
		var json,
			parentMap = {},
			lines = local.split( LINE_ENDING ),
			line, level, node;

		function addChild( parent, child ) {
			var children = parent.children || ( parent.children = [] );
			children.push( child );
		}

		for ( var i = 0; i < lines.length; i++ ) {
			line = lines[ i ];
			if ( isEmpty( line ) ) continue;

			level = getLevel( line );
			node = getNode( line );

			if ( level === 0 ) {
				if ( json ) {
					throw new Error( 'Invalid local format' );
				}
				json = node;
			} else {
				if ( !parentMap[ level - 1 ] ) {
					throw new Error( 'Invalid local format' );
				}
				addChild( parentMap[ level - 1 ], node );
			}
			parentMap[ level ] = node;
		}
		return json;
	}
	var lastTry, lastResult;

	function recognize( local ) {
		if ( !Utils.isString( local ) ) return false;
		lastTry = local;
		try {
			lastResult = decode( local );
		} catch ( e ) {
			lastResult = null;
		}
		return !!lastResult;
	}
	return {
		fileDescription: '大纲文本',
		fileExtension: '.txt',
		encode: function ( json ) {
			return encode( json, 0 );
		},
		decode: function ( local ) {
			if ( lastTry == local && lastResult ) {
				return lastResult;
			}
			return decode( local );
		},
		recognize: recognize,
		recognizePriority: -1
	};
} );

KityMinder.registerProtocal( 'json', function () {
	function filter( key, value ) {
		if ( key == 'layout' || key == 'shicon' ) {
			return undefined;
		}
		return value;
	}
	return {
		fileDescription: 'KityMinder',
		fileExtension: '.km',
		encode: function ( json ) {
			return JSON.stringify( json, filter );
		},
		decode: function ( local ) {
			return JSON.parse( local );
		},
		recognize: function ( local ) {
			return Utils.isString( local ) && local.charAt( 0 ) == '{' && local.charAt( local.length - 1 ) == '}';
		},
		recognizePriority: 0
	};
} );

