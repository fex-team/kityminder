/*!
 * ====================================================
 * kityminder - v1.1.3 - 2014-05-09
 * https://github.com/fex-team/kityminder
 * GitHub: https://github.com/fex-team/kityminder.git 
 * Copyright (c) 2014 f-cube @ FEX; Licensed MIT
 * ====================================================
 */

(function(kity, window) {

var KityMinder = window.KM = window.KityMinder = function () {
	var instanceMap = {}, instanceId = 0;
	return {
		version: '1.1.3',
		createMinder: function ( renderTarget, options ) {
			options = options || {};
			options.renderTo = Utils.isString( renderTarget ) ? document.getElementById( renderTarget ) : renderTarget;
			var minder = new Minder( options );
			this.addMinder( options.renderTo, minder );
			return minder;
		},
		addMinder: function ( target, minder ) {
			var id;
			if ( typeof ( target ) === 'string' ) {
				id = target;
			} else {
				id = target.id || ( "KM_INSTANCE_" + instanceId++ );
			}
			instanceMap[ id ] = minder;
		},
		getMinder: function ( target, options ) {
			var id;
			if ( typeof ( target ) === 'string' ) {
				id = target;
			} else {
				id = target.id || ( "KM_INSTANCE_" + instanceId++ );
			}
			return instanceMap[ id ] || this.createMinder( target, options );
		},
		//挂接多语言
		LANG: {}
	};
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
    },
    loadFile:function () {
        var tmpList = [];

        function getItem(doc, obj) {
            try {
                for (var i = 0, ci; ci = tmpList[i++];) {
                    if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                        return ci;
                    }
                }
            } catch (e) {
                return null;
            }

        }

        return function (doc, obj, fn) {
            var item = getItem(doc, obj);
            if (item) {
                if (item.ready) {
                    fn && fn();
                } else {
                    item.funs.push(fn)
                }
                return;
            }
            tmpList.push({
                doc:doc,
                url:obj.src || obj.href,
                funs:[fn]
            });
            if (!doc.body) {
                var html = [];
                for (var p in obj) {
                    if (p == 'tag')continue;
                    html.push(p + '="' + obj[p] + '"')
                }
                doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></' + obj.tag + '>');
                return;
            }
            if (obj.id && doc.getElementById(obj.id)) {
                return;
            }
            var element = doc.createElement(obj.tag);
            delete obj.tag;
            for (var p in obj) {
                element.setAttribute(p, obj[p]);
            }
            element.onload = element.onreadystatechange = function () {
                if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                    item = getItem(doc, obj);
                    if (item.funs.length > 0) {
                        item.ready = 1;
                        for (var fi; fi = item.funs.pop();) {
                            fi();
                        }
                    }
                    element.onload = element.onreadystatechange = null;
                }
            };
//            element.onerror = function () {
//                throw Error('The load ' + (obj.href || obj.src) + ' fails,check the url settings of file ')
//            };
            doc.getElementsByTagName("head")[0].appendChild(element);
        }
    }(),
    clone:function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (typeof tmp == 'object') {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clone(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    unhtml:function (str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function (a, b) {
            if (b) {
                return a;
            } else {
                return {
                    '<':'&lt;',
                    '&':'&amp;',
                    '"':'&quot;',
                    '>':'&gt;',
                    "'":'&#39;'
                }[a]
            }
        }) : '';
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
    setPoint: function ( x, y ) {
        if ( arguments.length < 2 ) {
            this.setData( "point", x );
        } else {
            this.setData( 'point', {
                x: x,
                y: y
            } );
        }
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
        node.root = node.parent.root;

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
        function cloneNode( parent, isClonedNode) {
            var _tmp = new KM.MinderNode( isClonedNode.getText() );

            _tmp.data = Utils.clonePlainObject( isClonedNode.getData() );
            _tmp.tmpData = Utils.clonePlainObject( isClonedNode.getTmpData() );
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
        utils.each( this.getContRc().getShapesByType( 'text' ), function ( i, t ) {
            if ( t.getAttr( '_nodeTextShape' ) ) {
                textShape = t;
                return false;
            }
        } );
        if(textShape === undefined)
            debugger
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
    select:function(){
        this.setTmpData('highlight',true)
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
    },
    isRightMB:function(){
        var isRightMB = false;
        if(!this.originEvent){
            return false;
        }
        if ("which" in this.originEvent)
            isRightMB = this.originEvent.which == 3;
        else if ("button" in this.originEvent)
            isRightMB = this.originEvent.button == 2;
        return isRightMB;
    }
} );

var Minder = KityMinder.Minder = kity.createClass( "KityMinder", {
    constructor: function ( options ) {
        this._options = Utils.extend( window.KITYMINDER_CONFIG || {}, options );
        this.setDefaultOptions( KM.defaultOptions );
        this._initEvents();
        this._initMinder();
        this._initSelection();
        this._initStatus();
        this._initShortcutKey();
        this._initContextmenu();
        this._initModules();

        if ( this.getOptions( 'readOnly' ) === true ) {
            this.setDisabled();
        }
        this.fire( 'ready' );
    },
    getOptions: function ( key ) {
        var val;
        if(key){
            val = this.getPreferences(key);
            return  val === null || val === undefined ? this._options[ key ] : val;
        }else{
            val = this.getPreferences();
            if(val){
                return utils.extend(val,this._options,true)
            }else{
                return this._options;
            }
        }
    },
    setDefaultOptions: function ( key, val,cover) {
        var obj = {};
        if ( Utils.isString( key ) ) {
            obj[ key ] = val;
        } else {
            obj = key;
        }
        utils.extend( this._options, obj, !cover );

    },
    setOptions: function ( key, val ) {
        this.setPreferences(key,val)
    },
    _initMinder: function () {

        this._paper = new kity.Paper();
        this._paper.getNode().setAttribute( 'contenteditable', true );
        this._paper.getNode().ondragstart = function ( e ) {
            e.preventDefault();
        };

        this._addRenderContainer();

        this._root = new MinderNode( this.getLang().maintopic );
        this._root.setType( "root" );
        if ( this._options.renderTo ) {
            this.renderTo( this._options.renderTo );
            //this._paper.setStyle( 'font-family', 'Arial,"Microsoft YaHei",sans-serif' );
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
    isTextEditStatus: function () {
        return false;
    },
    addShortcutKeys: function ( cmd, keys ) {
        var obj = {}, km = this;
        if ( keys ) {
            obj[ cmd ] = keys
        } else {
            obj = cmd;
        }
        utils.each( obj, function ( k, v ) {
            km._shortcutkeys[ k.toLowerCase() ] = v;
        } );

    },
    getShortcutKey: function ( cmdName ) {
        return this._shortcutkeys[ cmdName ]
    },
    _bindshortcutKeys: function () {
        var me = this,
            shortcutkeys = this._shortcutkeys;

        function checkkey( key, keyCode, e ) {
            switch ( key ) {
            case 'ctrl':
            case 'cmd':
                if ( e.ctrlKey || e.metaKey ) {
                    return true;
                }
                break;
            case 'alt':
                if ( e.altKey ) {
                    return true
                }
                break;
            case 'shift':
                if ( e.shiftKey ) {
                    return true;
                }

            }
            if ( keyCode == keymap[ key ] ) {
                return true;
            }
            return false
        }
        me.on( 'keydown', function ( e ) {

            var originEvent = e.originEvent;
            var keyCode = originEvent.keyCode || originEvent.which;
            for ( var i in shortcutkeys ) {
                var keys = shortcutkeys[ i ].toLowerCase().split( '+' );
                var current = 0;
                utils.each( keys, function ( i, k ) {
                    if ( checkkey( k, keyCode, originEvent ) ) {
                        current++;
                    }
                } );

                if ( current == keys.length ) {
                    if ( me.queryCommandState( i ) != -1 )
                        me.execCommand( i );
                    originEvent.preventDefault();
                    break;
                }

            }
        } );
    },
    _initContextmenu: function () {
        this.contextmenus = [];
    },
    addContextmenu: function ( item ) {
        if ( utils.isArray( item ) ) {
            this.contextmenus = this.contextmenus.concat( item );
        } else {
            this.contextmenus.push( item );
        }

        return this;
    },
    getContextmenu: function () {
        return this.contextmenus;
    },
    _initStatus: function () {
        this._status = "normal";
        this._rollbackStatus = "normal";
    },
    setStatus: function ( status ) {
        if ( status ) {
            this._rollbackStatus = this._status;
            this._status = status;
        } else {
            this._status = '';
        }
        return this;
    },
    rollbackStatus: function () {
        this._status = this._rollbackStatus;
    },
    getStatus: function () {
        return this._status;
    },
    setDisabled: function () {
        var me = this;
        //禁用命令
        me.bkqueryCommandState = me.queryCommandState;
        me.bkqueryCommandValue = me.queryCommandValue;
        me.queryCommandState = function ( type ) {
            var cmd = this._getCommand( type );
            if ( cmd && cmd.enableReadOnly === false ) {
                return me.bkqueryCommandState.apply( me, arguments );
            }
            return -1;
        };
        me.queryCommandValue = function ( type ) {
            var cmd = this._getCommand( type );
            if ( cmd && cmd.enableReadOnly === false ) {
                return me.bkqueryCommandValue.apply( me, arguments );
            }
            return null;
        };
        this.setStatus( 'readonly' );


        me.fire( 'interactchange' );
    },
    setEnabled: function () {
        var me = this;

        if ( me.bkqueryCommandState ) {
            me.queryCommandState = me.bkqueryCommandState;
            delete me.bkqueryCommandState;
        }
        if ( me.bkqueryCommandValue ) {
            me.queryCommandValue = me.bkqueryCommandValue;
            delete me.bkqueryCommandValue;
        }

        this.rollbackStatus();

        me.fire( 'interactchange' );
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

        //var t1 = ts( new Date(), '开始解析' );
        //*******************

        json = params.json || ( params.json = protocal.decode( local ) );

        if ( typeof json === 'object' && 'then' in json ) {
            var self = this;
            json.then( local, function ( data ) {
                //*******************
                //var t2 = ts( new Date(), '解压解析耗时', t1 );
                //*******************
                self._afterImportData( data, params );
                //*******************
                //ts( new Date(), '渲染耗时', t2 );
                //*******************
            } );
        } else {
            //*******************
            //var t2 = ts( new Date(), '解压解析耗时', t1 );
            //*******************
            this._afterImportData( json, params );
            //*******************
            //ts( new Date(), '渲染耗时', t2 );
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
        this.fire( 'beforeimport' );
        this._fire( new MinderEvent( 'import', params, false ) );
        this._firePharse( {
            type: 'contentchange'
        } );
        this._firePharse( {
            type: 'interactchange'
        } );
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
        this._paper.on( 'click dblclick mousedown contextmenu mouseup mousemove mousewheel DOMMouseScroll touchstart touchmove touchend', this._firePharse.bind( this ) );
        if ( window ) {
            window.addEventListener( 'resize', this._firePharse.bind( this ) );
            window.addEventListener( 'blur', this._firePharse.bind( this ) );
        }
    },
    _bindKeyboardEvents: function () {
        if ( ( navigator.userAgent.indexOf( 'iPhone' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPod' ) == -1 ) && ( navigator.userAgent.indexOf( 'iPad' ) == -1 ) ) {
            //只能在这里做，要不无法触发
            Utils.listen( document.body, 'keydown keyup keypress paste', this._firePharse.bind( this ) );
        }
    },
    _firePharse: function ( e ) {
//        //只读模式下强了所有的事件操作
//        if(this.readOnly === true){
//            return false;
//        }
        var beforeEvent, preEvent, executeEvent;

        if ( e.type == 'DOMMouseScroll' ) {
            e.type = 'mousewheel';
            e.wheelDelta = e.originEvent.wheelDelta = e.originEvent.detail * 120;
        }

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


        var status = this.getStatus();

        var callbacks = this._eventCallbacks[ e.type.toLowerCase() ] || [];

        if ( status ) {

            callbacks = callbacks.concat( this._eventCallbacks[ status + '.' + e.type.toLowerCase() ] || [] );
        }



        if ( callbacks.length === 0 ) {
            return;
        }
        var lastStatus = this.getStatus();

        for ( var i = 0; i < callbacks.length; i++ ) {

            callbacks[ i ].call( this, e );


            if ( this.getStatus() != lastStatus || e.shouldStopPropagationImmediately() ) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function ( name, callback ) {
        var km = this;
        utils.each( name.split( /\s+/ ), function ( i, n ) {
            km._listen( n.toLowerCase(), callback );
        } );
        return this;
    },
    off: function ( name, callback ) {

        var types = name.split( /\s+/ );
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

            if ( moduleDeals.defaultOptions ) {
                this.setDefaultOptions( moduleDeals.defaultOptions );
            }
            //添加模块的快捷键
            if ( moduleDeals.addShortcutKeys ) {
                this.addShortcutKeys( moduleDeals.addShortcutKeys )
            }

            //添加邮件菜单
            if(moduleDeals.contextmenu){
                this.addContextmenu(moduleDeals.contextmenu)
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

            if(!this._hasEnterExecCommand){
                if ( cmd.isSelectionChanged() ) {
                    this._firePharse( new MinderEvent( 'selectionchange' ) );
                }

                this._firePharse( new MinderEvent( 'interactchange' ) );
            }
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
        // node.traverse( function ( current ) {
        //     rc.addShape( current.getRenderContainer() );
        // } );
        rc.addShape( node.getRenderContainer() );
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
    },
    getMinderTitle: function () {
        return this.getRoot().getText();
    }

} );

var keymap = KityMinder.keymap = {
    'Backspace': 8,
    'Tab': 9,
    'Enter': 13,

    'Shift': 16,
    'Control': 17,
    'Alt': 18,
    'CapsLock': 20,

    'Esc': 27,

    'Spacebar': 32,

    'PageUp': 33,
    'PageDown': 34,
    'End': 35,
    'Home': 36,

    'Left': 37,
    'Up': 38,
    'Right': 39,
    'Down': 40,

    'Insert': 45,

    'Del': 46,

    'NumLock': 144,

    'Cmd': 91,

    'F2': 113,
    'F3': 114,
    'F4': 115,

    '=': 187,
    '-': 189,

    "b": 66,
    'i': 73,
    //回退
    'z': 90,
    'y': 89,
    //粘贴
    'v': 86,
    'x': 88,

    's': 83,

    'n': 78,
    '/': 191,
    '.': 190,
    'notContentInput': {
        8: 1,
        46: 1,
        13: 1,
        9: 1,
        33: 1,
        34: 1,
        35: 1,
        36: 1,
        16: 1,
        17: 1,
        18: 1,
        //上下左右
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        113:1
    },
    'isSelectedNodeKey': {
        //上下左右
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        13: 1,
        9: 1
    }
};

//添加多语言模块
kity.extendClass( Minder, {
    getLang: function ( path ) {

        var lang = KM.LANG[ this.getOptions( 'lang' ) ];
        if ( !lang ) {
            throw Error( "not import language file" );
        }
        path = ( path || "" ).split( "." );
        for ( var i = 0, ci; ci = path[ i++ ]; ) {
            lang = lang[ ci ];
            if ( !lang ) break;
        }
        return lang;
    }
} );

//这里只放不是由模块产生的默认参数
KM.defaultOptions = {
    zIndex : 1000,
    lang:'zh-cn',
    readyOnly:false
};

kity.extendClass( Minder, function(){

    var ROOTKEY = 'kityminder_preference';

    //创建存储机制
    var LocalStorage = ( function () {

        var storage = window.localStorage,
            LOCAL_FILE = "localStorage";

        return {

            saveLocalData: function ( key, data ) {

                if ( storage && data) {
                    storage.setItem( key, data  );
                    return true;
                }

                return false;

            },

            getLocalData: function ( key ) {

                if ( storage ) {
                    return storage.getItem( key );
                }

                return null;

            },

            removeItem: function ( key ) {

                storage && storage.removeItem( key );

            }

        };

    } )();
    return {
        setPreferences:function(key,value){
            var obj = {};
            if ( Utils.isString( key ) ) {
                obj[ key ] = value;
            } else {
                obj = key;
            }
            var data = LocalStorage.getLocalData(ROOTKEY);
            if(data){
                data = JSON.parse(data);
                utils.extend(data, obj);
            }else{
                data = obj;
            }
            LocalStorage.saveLocalData(ROOTKEY,JSON.stringify(data));
        },
        getPreferences:function(key){
            var data = LocalStorage.getLocalData(ROOTKEY);
            if(data){
                data = JSON.parse(data);
                return key ? data[key] : data
            }
            return null;
        },
        resetPreferences:function(pres){
            var str = pres ? JSON.stringify(pres) : '';
            LocalStorage.saveLocalData(str)
        }
    }

}() );

/**
 * 浏览器判断模块
 * @file
 * @module UE.browser
 * @since 1.2.6.1
 */

/**
 * 提供浏览器检测的模块
 * @unfile
 * @module KM.browser
 */
var browser = KityMinder.browser = function(){
    var agent = navigator.userAgent.toLowerCase(),
        opera = window.opera,
        browser = {
        /**
         * @property {boolean} ie 检测当前浏览器是否为IE
         * @example
         * ```javascript
         * if ( UE.browser.ie ) {
         *     console.log( '当前浏览器是IE' );
         * }
         * ```
         */
        ie		:  /(msie\s|trident.*rv:)([\w.]+)/.test(agent),

        /**
         * @property {boolean} opera 检测当前浏览器是否为Opera
         * @example
         * ```javascript
         * if ( UE.browser.opera ) {
         *     console.log( '当前浏览器是Opera' );
         * }
         * ```
         */
        opera	: ( !!opera && opera.version ),

        /**
         * @property {boolean} webkit 检测当前浏览器是否是webkit内核的浏览器
         * @example
         * ```javascript
         * if ( UE.browser.webkit ) {
         *     console.log( '当前浏览器是webkit内核浏览器' );
         * }
         * ```
         */
        webkit	: ( agent.indexOf( ' applewebkit/' ) > -1 ),

        /**
         * @property {boolean} mac 检测当前浏览器是否是运行在mac平台下
         * @example
         * ```javascript
         * if ( UE.browser.mac ) {
         *     console.log( '当前浏览器运行在mac平台下' );
         * }
         * ```
         */
        mac	: ( agent.indexOf( 'macintosh' ) > -1 ),

        /**
         * @property {boolean} quirks 检测当前浏览器是否处于“怪异模式”下
         * @example
         * ```javascript
         * if ( UE.browser.quirks ) {
         *     console.log( '当前浏览器运行处于“怪异模式”' );
         * }
         * ```
         */
        quirks : ( document.compatMode == 'BackCompat' )
    };

    /**
    * @property {boolean} gecko 检测当前浏览器内核是否是gecko内核
    * @example
    * ```javascript
    * if ( UE.browser.gecko ) {
    *     console.log( '当前浏览器内核是gecko内核' );
    * }
    * ```
    */
    browser.gecko =( navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);

    var version = 0;

    // Internet Explorer 6.0+
    if ( browser.ie ){

        var v1 =  agent.match(/(?:msie\s([\w.]+))/);
        var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
        if(v1 && v2 && v1[1] && v2[1]){
            version = Math.max(v1[1]*1,v2[1]*1);
        }else if(v1 && v1[1]){
            version = v1[1]*1;
        }else if(v2 && v2[1]){
            version = v2[1]*1;
        }else{
            version = 0;
        }

        browser.ie11Compat = document.documentMode == 11;
        /**
         * @property { boolean } ie9Compat 检测浏览器模式是否为 IE9 兼容模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie9Compat ) {
         *     console.log( '当前浏览器运行在IE9兼容模式下' );
         * }
         * ```
         */
        browser.ie9Compat = document.documentMode == 9;

        /**
         * @property { boolean } ie8 检测浏览器是否是IE8浏览器
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie8 ) {
         *     console.log( '当前浏览器是IE8浏览器' );
         * }
         * ```
         */
        browser.ie8 = !!document.documentMode;

        /**
         * @property { boolean } ie8Compat 检测浏览器模式是否为 IE8 兼容模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie8Compat ) {
         *     console.log( '当前浏览器运行在IE8兼容模式下' );
         * }
         * ```
         */
        browser.ie8Compat = document.documentMode == 8;

        /**
         * @property { boolean } ie7Compat 检测浏览器模式是否为 IE7 兼容模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie7Compat ) {
         *     console.log( '当前浏览器运行在IE7兼容模式下' );
         * }
         * ```
         */
        browser.ie7Compat = ( ( version == 7 && !document.documentMode )
                || document.documentMode == 7 );

        /**
         * @property { boolean } ie6Compat 检测浏览器模式是否为 IE6 模式 或者怪异模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie6Compat ) {
         *     console.log( '当前浏览器运行在IE6模式或者怪异模式下' );
         * }
         * ```
         */
        browser.ie6Compat = ( version < 7 || browser.quirks );

        browser.ie9above = version > 8;

        browser.ie9below = version < 9;

    }

    // Gecko.
    if ( browser.gecko ){
        var geckoRelease = agent.match( /rv:([\d\.]+)/ );
        if ( geckoRelease )
        {
            geckoRelease = geckoRelease[1].split( '.' );
            version = geckoRelease[0] * 10000 + ( geckoRelease[1] || 0 ) * 100 + ( geckoRelease[2] || 0 ) * 1;
        }
    }

    /**
     * @property { Number } chrome 检测当前浏览器是否为Chrome, 如果是，则返回Chrome的大版本号
     * @warning 如果浏览器不是chrome， 则该值为undefined
     * @example
     * ```javascript
     * if ( UE.browser.chrome ) {
     *     console.log( '当前浏览器是Chrome' );
     * }
     * ```
     */
    if (/chrome\/(\d+\.\d)/i.test(agent)) {
        browser.chrome = + RegExp['\x241'];
    }

    /**
     * @property { Number } safari 检测当前浏览器是否为Safari, 如果是，则返回Safari的大版本号
     * @warning 如果浏览器不是safari， 则该值为undefined
     * @example
     * ```javascript
     * if ( UE.browser.safari ) {
     *     console.log( '当前浏览器是Safari' );
     * }
     * ```
     */
    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)){
    	browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
    }


    // Opera 9.50+
    if ( browser.opera )
        version = parseFloat( opera.version() );

    // WebKit 522+ (Safari 3+)
    if ( browser.webkit )
        version = parseFloat( agent.match( / applewebkit\/(\d+)/ )[1] );

    /**
     * @property { Number } version 检测当前浏览器版本号
     * @remind
     * <ul>
     *     <li>IE系列返回值为5,6,7,8,9,10等</li>
     *     <li>gecko系列会返回10900，158900等</li>
     *     <li>webkit系列会返回其build号 (如 522等)</li>
     * </ul>
     * @example
     * ```javascript
     * console.log( '当前浏览器版本号是： ' + UE.browser.version );
     * ```
     */
    browser.version = version;

    /**
     * @property { boolean } isCompatible 检测当前浏览器是否能够与UEditor良好兼容
     * @example
     * ```javascript
     * if ( UE.browser.isCompatible ) {
     *     console.log( '浏览器与UEditor能够良好兼容' );
     * }
     * ```
     */
    browser.isCompatible =
        !browser.mobile && (
        ( browser.ie && version >= 6 ) ||
        ( browser.gecko && version >= 10801 ) ||
        ( browser.opera && version >= 9.5 ) ||
        ( browser.air && version >= 1 ) ||
        ( browser.webkit && version >= 522 ) ||
        false );
    return browser;
}();
//快捷方式
var ie = browser.ie,
    webkit = browser.webkit,
    gecko = browser.gecko,
    opera = browser.opera;

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
            return this.getData().clone(  );
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
            this.km.fire( 'restoreScene' );
            this.km.fire( 'contentChange' );
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
        /*Shift*/
        16: 1,
        /*Ctrl*/
        17: 1,
        /*Alt*/
        18: 1,
        /*Command*/
        91: 1,
        37: 1,
        38: 1,
        39: 1,
        40: 1
    },
        keycont = 0,
        lastKeyCode,
        saveSceneTimer;
    return {
        defaultOptions: {
            maxUndoCount: 20,
            maxInputCount: 20
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
            "Undo": "ctrl+z", //undo
            "Redo": "ctrl+y" //redo
        },
        "events": {
            "saveScene": function ( e ) {
                this.historyManager.saveScene();
            },
            'renderNode': function ( e ) {
                var node = e.node;
                if ( node.isSelected() ) {
                    this.select( node )
                }
            },
            "keydown": function ( e ) {
                var orgEvt = e.originEvent;
                var keyCode = orgEvt.keyCode || orgEvt.which;
                if ( !keys[ keyCode ] && !orgEvt.ctrlKey && !orgEvt.metaKey && !orgEvt.shiftKey && !orgEvt.altKey ) {


                    if ( km.historyManager.list.length == 0 ) {
                        km.historyManager.saveScene();
                    }
                    clearTimeout( saveSceneTimer );

                    saveSceneTimer = setTimeout( function () {
                        km.historyManager.saveScene();
                    }, 200 );

                    lastKeyCode = keyCode;
                    keycont++;
                    if ( keycont >= km.getOptions( 'maxInputCount' ) ) {
                        km.historyManager.saveScene()
                    }
                }
            },
            "import": function () {
                this.historyManager.reset()
            }
        }
    };
} );

KityMinder.registerModule( "IconModule", function () {
	var minder = this;
	var renderPriorityIcon = function ( node, val ) {
		var colors = [ "", "#A92E24", "#29A6BD", "#1E8D54", "#eb6100", "#876DDA" ];
		var _bg = new kity.Rect().fill( colors[ val ] ).setRadius( 3 ).setWidth( 20 ).setHeight( 20 );
		var _number = new kity.Text().setContent( val ).fill( "white" ).setSize( 12 );
		var _rc = new kity.Group();
		_rc.addShapes( [ _bg, _number ] );
		node.getContRc().addShape( _rc );
		_number.setTranslate( 6, 15 );
		var rcHeight = _rc.getHeight();
		_rc.setTranslate( 0, -rcHeight / 2 );
	};

	var renderProgressIcon = function ( node, val ) {
		var _rc = new kity.Group();
		var _contRc = node.getContRc();
		var _bg = new kity.Circle().setRadius( 8 ).fill( "white" ).stroke( new kity.Pen( "#29A6BD", 2 ) );
		var _percent, d;
		if ( val < 5 ) {
			_percent = new kity.Path();
			d = _percent.getDrawer();
			d.moveTo( 0, 0 ).lineTo( 6, 0 );
		} else _percent = new kity.Group();
		_rc.addShapes( [ _bg, _percent ] );
		_contRc.addShape( _rc );
		switch ( val ) {
		case 1:
			break;
		case 2:
			d.carcTo( 6, 0, 0, 0, -6 );
			break;
		case 3:
			d.carcTo( 6, 0, 0, -6, 0 );
			break;
		case 4:
			d.carcTo( 6, 1, 0, 0, 6 );
			break;
		case 5:
			var check = new kity.Path();
			_percent.addShapes( [ new kity.Circle().setRadius( 6 ).fill( "#29A6BD" ), check ] );
			check.getDrawer().moveTo( -3, 0 ).lineTo( -1, 3 ).lineTo( 3, -2 );
			check.stroke( new kity.Pen( "white", 2 ).setLineCap( "round" ) );
			break;
		}
		if ( val < 5 ) d.close();
		_percent.fill( "#29A6BD" );
		var pre = node.getData( "PriorityIcon" );
		var style = minder.getCurrentLayoutStyle()[ node.getType() ];
		if ( !pre ) _rc.setTranslate( _rc.getWidth() / 2, 0 );
		else _rc.setTranslate( _contRc.getWidth() + style.spaceLeft, 0 );
	};
	var setPriorityCommand = kity.createClass( "SetPriorityCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( "PriorityIcon", value );
					km.updateLayout( nodes[ i ] );
				}
			},
			queryValue: function ( km ) {
				var nodes = km.getSelectedNodes();
				var val;
				for ( var i = 0; i < nodes.length; i++ ) {
					val = nodes[ i ].getData( "PriorityIcon" );
					if ( val ) break;
				}
				return val;
			}
		};
	} )() );
	var setProgressCommand = kity.createClass( "SetProgressCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, value ) {
				var nodes = km.getSelectedNodes();
				for ( var i = 0; i < nodes.length; i++ ) {
					nodes[ i ].setData( "ProgressIcon", value );
					km.updateLayout( nodes[ i ] );
				}
			},
			queryValue: function ( km ) {
				var nodes = km.getSelectedNodes();
				var val;
				for ( var i = 0; i < nodes.length; i++ ) {
					val = nodes[ i ].getData( "ProgressIcon" );
					if ( val ) break;
				}
				return val;
			}
		};
	} )() );
	return {
		"commands": {
			"priority": setPriorityCommand,
			"progress": setProgressCommand
		},
		"events": {
			"RenderNodeLeft": function ( e ) {
				var node = e.node;
				var PriorityIconVal = node.getData( "PriorityIcon" );
				var ProgressIconVal = node.getData( "ProgressIcon" );
				var contRc = node.getContRc();
				if ( PriorityIconVal ) {
					renderPriorityIcon( node, PriorityIconVal );
				}
				if ( ProgressIconVal ) {
					renderProgressIcon( node, ProgressIconVal );
				}
			}
		}
	};
} );

KityMinder.registerModule( "LayoutModule", function () {
	var me = this;
	var clearPaper = function () {
		me._rc.remove();
		me._rc = new kity.Group();
		me._paper.addShape( this._rc );
	};
	kity.extendClass( Minder, {
		addLayoutStyle: function ( name, style ) {
			if ( !this._layoutStyles ) this._layoutStyles = {};
			this._layoutStyles[ name ] = style;
		},
		getLayoutStyle: function ( name ) {
			return this._layoutStyles[ name ];
		},

		getLayoutStyleItems: function () {
			var items = [];
			for ( var key in this._layoutStyles ) {
				items.push( key );
			}
			return items;
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
		getCurrentLayoutStyle: function () {
			var curStyle = this.getCurrentStyle();
			return this.getLayoutStyle( curStyle ).getCurrentLayoutStyle.call( this );
		},
		highlightNode: function ( node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).highlightNode.call( this, node );
		},
		initStyle: function () {
			var curStyle = this.getCurrentStyle();
			this._rc.remove();
			var transform = this._rc.transform;
			this._rc = new kity.Group();
			this._paper.addShape( this._rc );

			this._rc.transform = transform;
			this._rc._applyTransform();

			var _root = this.getRoot();
			_root.preTraverse( function ( n ) {
				n.clearLayout();
			} );
			this.getLayoutStyle( curStyle ).initStyle.call( this );
			this.fire( 'afterinitstyle' );
		},
		appendChildNode: function ( parent, node, focus, index ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).appendChildNode.call( this, parent, node, focus, index );
		},
		appendSiblingNode: function ( sibling, node, focus ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).appendSiblingNode.call( this, sibling, node, focus );
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
			execute: switchLayout,
			queryValue: function ( km ) {
				return km.getCurrentStyle();
			}
		};
	} )() );
	var AppendChildNodeCommand = kity.createClass( "AppendChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node, focus, silbling ) {
				var parent = km.getSelectedNode();

				if ( !parent ) {
					return null;
				}
				if ( parent.getType() !== "root" && parent.getChildren().length !== 0 && !parent.isExpanded() ) {
					km.expandNode( parent );
				}
				parent.expand();
				km.appendChildNode( parent, node, focus, silbling );
				km.select( node, true );
				return node;
			},
			queryState: function ( km ) {
				var selectedNode = km.getSelectedNode();
				if ( !selectedNode ) {
					return -1;
				} else {
					return 0;
				}
			}
		};
	} )() );
	var AppendSiblingNodeCommand = kity.createClass( "AppendSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node, focus ) {
				var selectedNode = km.getSelectedNode();
				if ( !selectedNode ) {
					return null;
				}

				if ( selectedNode.isRoot() ) {
					node.setType( "main" );
					km.appendChildNode( selectedNode, node, focus );
				} else {
					km.appendSiblingNode( selectedNode, node, focus );
				}
				km.select( node, true );
				return node;
			},
			queryState: function ( km ) {
				var selectedNodes = km.getSelectedNodes();
				//没选中节点和单选root的时候返回不可执行
				if ( selectedNodes.length === 0 || ( selectedNodes.length === 1 && selectedNodes[ 0 ] === km.getRoot() ) ) {
					return -1;
				} else {
					return 0;
				}
			}
		};
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {

				if ( km.getRoot().children.length == 0 ) {
					return;
				}

				var selectedNodes = km.getSelectedNodes();
				var _root = km.getRoot();
				var _buffer = [];
				for ( var i = 0; i < selectedNodes.length; i++ ) {
					_buffer.push( selectedNodes[ i ] );
				}
				do {
					var parent = _buffer[ 0 ].getParent();
					if ( parent && _buffer.indexOf( parent ) === -1 ) _buffer.push( parent );
					_buffer.shift();
				} while ( _buffer.length > 1 );
				km.removeNode( selectedNodes );
				km.select( _buffer[ 0 ] );
			},
			queryState: function ( km ) {
				var selectedNodes = km.getSelectedNodes();
				if ( selectedNodes.length === 0 || ( selectedNodes.length === 1 && selectedNodes[ 0 ] === km.getRoot() ) ) {
					return -1;
				} else {
					return 0;
				}
			}
		};
	} )() );
	var EditNodeCommand = kity.createClass( "EditNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				var selectedNode = km.getSelectedNode();
				if ( !selectedNode ) {
					return null;
				}
				km.select( selectedNode, true );
				km.textEditNode( selectedNode );
			},
			queryState: function ( km ) {
				var selectedNode = km.getSelectedNode();
				if ( !selectedNode ) {
					return -1;
				} else {
					return 0;
				}
			},
			isNeedUndo: function () {
				return false;
			}
		};
	} )() );

	return {
		"commands": {
			"appendchildnode": AppendChildNodeCommand,
			"appendsiblingnode": AppendSiblingNodeCommand,
			"removenode": RemoveNodeCommand,
			"editnode": EditNodeCommand,
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
					this.fire( 'contentchange' );
				}
			},
			"resize": function ( e ) {
				clearTimeout( this._lastStyleResetTimeout );
				this._lastStyleResetTimeout = setTimeout( function () {
					this.updateLayout( this.getRoot() );
				}.bind( this ), 100 );
			},
			"import": function ( e ) {
				this.initStyle();
			}
		},
		'contextmenu': [ {
				label: this.getLang( 'node.appendsiblingnode' ),
				exec: function () {
					this.execCommand( 'appendsiblingnode', new MinderNode( this.getLang( 'topic' ) ) )
				},
				cmdName: 'appendsiblingnode'
			}, {
				label: this.getLang( 'node.appendchildnode' ),
				exec: function () {
					this.execCommand( 'appendchildnode', new MinderNode( this.getLang( 'topic' ) ) )
				},
				cmdName: 'appendchildnode'
			}, {
				label: this.getLang( 'node.editnode' ),
				exec: function () {
					this.execCommand( 'editnode', null );
				},
				cmdName: 'editnode'
			}, {
				label: this.getLang( 'node.removenode' ),
				cmdName: 'removenode'
			}, {
				divider: 1
			}

		],
		"defaultOptions": {
			"defaultlayoutstyle": "default",
			"node": {
				'appendsiblingnode': 'appendsiblingnode',
				'appendchildnode': 'appendchildnode',
				'editnode': 'editnode',
				'removenode': 'removenode'
			},
			'defaultExpand': {
				'defaultLayer': 0,
				'defaultSubShow': 0
			}
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
			},
			switchState: function ( val ) {
				if ( val === true || val === false )
					this._show = !val;
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
					nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x - 5;
				} else {
					nodeX = nodeShape.getRenderBox().closurePoints[ 0 ].x + 6;
					if ( node.getType() === "main" ) nodeX -= 3;
				}
				this.shape.setTranslate( nodeX, nodeY );
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
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 3,
			spaceRight: 0,
			spaceTop: 3,
			spaceBottom: 3
		},
		"main": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			fill: '#A4c5c0',
			color: "#333",
			padding: [ 6.5, 20, 6.5, 20 ],
			fontSize: 16,
			margin: [ 0, 10, 30, 50 ],
			radius: 10,
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 5,
			spaceRight: 0,
			spaceTop: 2,
			spaceBottom: 2

		},
		"sub": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			color: "white",
			fontSize: 12,
			margin: [ 0, 10, 20, 6 ],
			padding: [ 5, 10, 5.5, 10 ],
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 4,
			spaceRight: 0,
			spaceTop: 2,
			spaceBottom: 2
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
			node.getBgRc().clear().addShapes( [ Layout.bgRect = new kity.Rect().setRadius( 4 ), highlightshape, underline ] );
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
		//var txtShape = node.getTextShape();
		//txtShape.fill( nodeStyle.color ).setSize( nodeStyle.fontSize ).setY( -3 );
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
			width = _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ];
			height = _contHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ];
			Layout.underline.getDrawer()
				.clear()
				.moveTo( 0, _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] )
				.lineTo( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ], _contHeight + nodeStyle.padding[ 2 ] + nodeStyle.padding[ 0 ] );
			Layout.underline.stroke( nodeStyle.stroke );
			Layout.highlightshape
				.setWidth( _contWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ] )
				.setHeight( _contHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
			Layout.bgRect.setWidth( width ).setHeight( height );
			break;
		default:
			break;
		}
		contRc.setTranslate( nodeStyle.padding[ 3 ], nodeStyle.padding[ 0 ] + _contRCHeight / 2 );
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
					if ( children[ i ].getRenderContainer().getPaper() && children[ i ].getRenderContainer().getHeight() !== 0 )
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
				var nodeHeight = node.getRenderContainer().getHeight() || ( node.getContRc().getHeight() + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ] );
				Layout.branchheight = nodeHeight + nodeStyle.margin[ 0 ] + nodeStyle.margin[ 2 ];
			} else if ( action === "change" ) {
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
		}
		//自顶向下更新受影响一侧的y值
		var updateSide = function ( appendside ) {
			var _buffer = [ root ];
			while ( _buffer.length > 0 ) {
				var _buffer0Layout = _buffer[ 0 ].getLayout();
				var children = _buffer0Layout[ appendside + "List" ] || _buffer[ 0 ].getChildren();
				var children = ( function () {
					var result = [];
					for ( var len = 0; len < children.length; len++ ) {
						var l = children[ len ].getLayout();
						if ( l.added ) {
							result.push( children[ len ] );
						}
					}
					return result;
				} )();
				_buffer = _buffer.concat( children );
				var sY = _buffer0Layout.y - ( _buffer0Layout[ appendside + "Height" ] || _buffer0Layout.branchheight ) / 2;
				for ( var i = 0; i < children.length; i++ ) {
					var childLayout = children[ i ].getLayout();
					childLayout.y = sY + childLayout.branchheight / 2;
					sY += childLayout.branchheight;
				}
				if ( _buffer[ 0 ] !== root && _buffer[ 0 ].getLayout().added ) effectSet.push( _buffer[ 0 ] );
				_buffer.shift();
			}
		};
		var sideList;
		if ( appendside ) {
			updateSide( appendside );
		} else {
			updateSide( "left" );
			updateSide( "right" );
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
			var children = _buffer[ 0 ].getChildren();
			children = ( function () {
				var result = [];
				for ( var len = 0; len < children.length; len++ ) {
					var l = children[ len ].getLayout();
					if ( l.added ) {
						result.push( children[ len ] );
					}
				}
				return result;
			} )();
			_buffer = _buffer.concat( children );
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
			nodeShape.setTranslate( Layout.x - _rectWidth, Layout.y - _rectHeight / 2 );
			break;
		case "center":
			nodeShape.setTranslate( Layout.x - _rectWidth / 2, Layout.y - _rectHeight / 2 );
			break;
		default:
			nodeShape.setTranslate( Layout.x, Layout.y - _rectHeight / 2 );
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
				endPos = new kity.BezierPoint( nodeClosurePoints[ 2 ].x + 3, nodeClosurePoints[ 2 ].y + nodeShape.getHeight() / 2 );
			} else {
				sPos = new kity.BezierPoint( rootX + 30, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
				endPos = new kity.BezierPoint( nodeClosurePoints[ 3 ].x - 3, nodeClosurePoints[ 3 ].y + nodeShape.getHeight() / 2 );
			}
			var sPosV = sPos.getVertex();
			var endPosV = endPos.getVertex();
			sPos.setVertex( rootX, rootY );
			connect.bezier.setPoints( [ sPos, endPos ] ).stroke( nodeStyle.stroke );
			connect.circle.setCenter( endPosV.x + ( Layout.appendside === "left" ? -0.5 : -1.5 ), endPosV.y ).fill( "white" ).setRadius( 4 );
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
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 1, nodeX, nodeY );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 0, nodeX, nodeY );
				connect.stroke( nodeStyle.stroke );
			} else {
				sX = parentBox.closurePoints[ 0 ].x + parentStyle.margin[ 1 ];
				nodeX = Shape.getRenderBox().closurePoints[ 1 ].x + 1;
				connect.getDrawer()
					.clear()
					.moveTo( sX, sY )
					.lineTo( sX, nodeY > sY ? ( nodeY - nodeStyle.margin[ 3 ] ) : ( nodeY + nodeStyle.margin[ 3 ] ) );
				if ( nodeY > sY ) connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 0, nodeX, nodeY );
				else connect.getDrawer().carcTo( nodeStyle.margin[ 3 ], 0, 1, nodeX, nodeY );
				connect.stroke( nodeStyle.stroke );
			}
		}
		//更新收放icon
		if ( nodeType !== "root" && node.getChildren().length !== 0 ) {
			if ( !Layout.shicon ) {
				Layout.shicon = new ShIcon( node );
			}
			Layout.shicon.update();
		}
	};

	// var showNodeInView = function ( node ) {
	// 	// var padding = 5;
	// 	// var viewport = minder.getPaper().getViewPort();
	// 	// var offset = node.getRenderContainer().getRenderBox( minder.getRenderContainer() );

	// 	// var tmpX = viewport.center.x * 2 - ( offset.x + offset.width );
	// 	// var tmpY = viewport.center.y * 2 - ( offset.y + offset.height );

	// 	// var dx = offset.x < 0 ? -offset.x : Math.min( tmpX, 0 );
	// 	// var dy = offset.y < 0 ? -offset.y : Math.min( tmpY, 0 );

	// 	// minder.getRenderContainer().fxTranslate( dx, dy, 100, "easeOutQuint" );
	// };

	var _style = {
		getCurrentLayoutStyle: function () {
			return nodeStyles;
		},
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
					node.getTextShape().fill( node.getData( 'fontcolor' ) || 'black' );
				} else {
					Layout.highlightshape.setOpacity( 0 );
					node.getTextShape().fill( node.getData( 'fontcolor' ) || 'white' );
				}
				break;
			default:
				break;
			}
		},
		updateLayout: function ( node ) {
			node.getContRc().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNode", {
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
			if ( this.isNodeSelected( node ) ) {
				this.highlightNode( node )
			}
		},
		initStyle: function () {
			//渲染根节点
			var _root = minder.getRoot();
			var historyPoint = _root.getPoint();
			if ( historyPoint ) historyPoint = JSON.parse( JSON.stringify( historyPoint ) );
			minder.handelNodeInsert( _root );
			//设置root的align
			_root.getLayout().align = "center";
			updateBg( _root );
			initLayout( _root );
			_root.getContRc().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNode", {
				node: _root
			}, false ) );
			updateShapeByCont( _root );
			updateLayoutHorizon( _root );
			updateLayoutVertical( _root );
			translateNode( _root );
			if ( historyPoint ) _root.setPoint( historyPoint.x, historyPoint.y );
			//渲染首层节点
			var mains = _root.getChildren();
			for ( var i = 0; i < mains.length; i++ ) {
				this.appendChildNode( _root, mains[ i ] );
				if ( mains[ i ].isExpanded() && ( mains[ i ].getChildren().length > 0 ) ) {
					minder.expandNode( mains[ i ] );
				}
			}
			_root.setPoint( _root.getLayout().x, _root.getLayout().y );
		},
		expandNode: function ( ico ) {
			var isExpand, node;
			if ( ico instanceof MinderNode ) {
				node = ico;
				isExpand = node.getLayout().shicon.switchState();
			} else {
				isExpand = ico.icon.switchState();
				node = ico.icon._node;
			}
			var _buffer;
			if ( isExpand ) {
				node.expand();
				//遍历子树展开需要展开的节点
				_buffer = [ node ];
				while ( _buffer.length !== 0 ) {
					var c = _buffer[ 0 ].getChildren();
					if ( _buffer[ 0 ].isExpanded() && c.length !== 0 ) {
						for ( var x = 0; x < c.length; x++ ) {
							minder.appendChildNode( _buffer[ 0 ], c[ x ] );
						}
						_buffer = _buffer.concat( c );
					}
					_buffer.shift();
				}
			} else {
				node.collapse();
				//遍历子树移除需要移除的节点
				_buffer = node.getChildren();
				while ( _buffer.length !== 0 ) {
					var Layout = _buffer[ 0 ].getLayout();
					if ( Layout.added ) {
						Layout.added = false;
						_buffer[ 0 ].getRenderContainer().remove();
						Layout.connect.remove();
						if ( Layout.shicon ) Layout.shicon.remove();
					}
					_buffer = _buffer.concat( _buffer[ 0 ].getChildren() );
					_buffer.shift();
				}
				var set = updateLayoutVertical( node, node.getParent(), "contract" );
				for ( var i = 0; i < set.length; i++ ) {
					translateNode( set[ i ] );
					updateConnectAndshIcon( set[ i ] );
				}
			}
		},
		appendChildNode: function ( parent, node, focus, sibling ) {
			minder.handelNodeInsert( node );
			var Layout = node.getLayout();
			node.clearLayout();
			node.getContRc().clear();
			Layout = node.getLayout();
			Layout.added = true;
			var parentLayout = parent.getLayout();
			var children = parent.getChildren();
			var exist = ( children.indexOf( node ) !== -1 );
			if ( sibling ) {
				if ( !exist ) parent.insertChild( node, sibling.getIndex() + 1 );
				var siblingLayout = sibling.getLayout();
				Layout.appendside = siblingLayout.appendside;
				Layout.align = siblingLayout.align;
				if ( parent.getType() === "root" ) {
					minder.handelNodeInsert( node );
					var len = children.length;
					if ( len < 7 ) {
						if ( len % 2 ) {
							Layout.appendside = "right";
							Layout.align = "left";
						} else {
							Layout.appendside = "left";
							Layout.align = "right";
						}
					}
					var sideList = parentLayout[ Layout.appendside + "List" ];
					var idx = sideList.indexOf( sibling );
					sideList.splice( idx + 1, 0, node );
				}
			} else {
				if ( parent.getType() !== "root" ) {
					var prtLayout = parent.getLayout();
					Layout.appendside = prtLayout.appendside;
					Layout.align = prtLayout.align;
					if ( !exist ) parent.appendChild( node );
				} else {
					var nodeP = node.getPoint();
					if ( nodeP && nodeP.x && nodeP.y ) {
						if ( nodeP.x > parent.getPoint().x ) {
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
					if ( !exist ) parent.insertChild( node, idx1 );
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
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNode", {
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

			// if ( focus ) {
			// 	showNodeInView( node );
			// }
			parent.expand();
			var shicon = parent.getLayout().shicon;
			if ( shicon ) shicon.switchState( true );
		},
		appendSiblingNode: function ( sibling, node, focus ) {
			var parent = sibling.getParent();
			this.appendChildNode( parent, node, focus, sibling );
		},
		removeNode: function ( nodes ) {
			while ( nodes.length !== 0 ) {
				var parent = nodes[ 0 ].getParent();
				if ( !parent ) {
					nodes.splice( 0, 1 );
					return false;
				}
				var nodeLayout = nodes[ 0 ].getLayout();
				if ( parent.getType() === "root" ) {
					var sideList = parent.getLayout()[ nodeLayout.appendside + "List" ];
					var index = sideList.indexOf( nodes[ 0 ] );
					sideList.splice( index, 1 );
				}
				parent.removeChild( nodes[ 0 ] );
				if ( parent.getType() !== "root" && parent.getChildren().length === 0 ) {
					var prtLayout = parent.getLayout();
					prtLayout.shicon.remove();
					prtLayout.shicon = null;
				}
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
		}
	};
	this.addLayoutStyle( "default", _style );
	return {};
} );

KityMinder.registerModule( "LayoutBottom", function () {
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
				var rect = this._rect = new kity.Rect().fill( "white" ).stroke( "gray" ).setRadius( 2 ).setWidth( 10 ).setHeight( 10 );
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
				if ( node.getType() === "main" ) minder.getRenderContainer().addShape( iconShape );
				else {
					node.getLayout().subgroup.addShape( iconShape );
				}
				iconShape.addShapes( [ rect, plus, dec ] );
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
				var nodeType = node.getType();
				var nodeX = nodeShape.getRenderBox().closurePoints[ 1 ].x + 5;
				var nodeY = nodeShape.getRenderBox().closurePoints[ 0 ].y;
				this.shape.setTranslate( nodeX, nodeY );
			},
			remove: function () {
				this.shape.remove();
			}
		};
	} )() );
	//样式的配置（包括颜色、字号等）
	var nodeStyles = {
		"root": {
			color: '#430',
			fill: '#e9df98',
			fontSize: 24,
			padding: [ 15.5, 25.5, 15.5, 25.5 ],
			margin: [ 0, 0, 20, 0 ],
			radius: 0,
			highlight: 'rgb(254, 219, 0)'
		},
		"main": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			fill: '#A4c5c0',
			color: "#333",
			padding: [ 6.5, 20, 6.5, 20 ],
			fontSize: 16,
			margin: [ 20, 20, 10, 10 ],
			radius: 0,
			highlight: 'rgb(254, 219, 0)'
		},
		"sub": {
			stroke: new kity.Pen( "white", 2 ).setLineCap( "round" ).setLineJoin( "round" ),
			color: "#333",
			fontSize: 12,
			margin: [ 10, 10, 10, 30 ],
			padding: [ 5, 10, 5.5, 10 ],
			highlight: 'rgb(254, 219, 0)',
			fill: 'rgb(231, 243, 255)'
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
			var bgRc = node.getBgRc().clear();
			bgRc.addShape( Layout.bgRect = new kity.Rect() );
			Layout.bgRect.fill( nodeStyle.fill );
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
		// var txtShape = node.getTextShape();
		// txtShape.fill( nodeStyle.color ).setSize( nodeStyle.fontSize ).setY( -3 );
		if ( nodeType === "main" ) {
			var subgroup = Layout.subgroup = new kity.Group();
			minder.getRenderContainer().addShape( subgroup );
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
			width = _contRCWidth + nodeStyle.padding[ 1 ] + nodeStyle.padding[ 3 ];
			height = _contRCHeight + nodeStyle.padding[ 0 ] + nodeStyle.padding[ 2 ];
			Layout.bgRect.setWidth( width ).setHeight( height );
			break;
		default:
			break;
		}
		contRc.setTranslate( nodeStyle.padding[ 3 ], nodeStyle.padding[ 0 ] + _contRCHeight / 2 );
	};
	var updateLayoutMain = function () {
		var _root = minder.getRoot();
		var mainnodes = _root.getChildren();
		var countMainWidth = function ( node ) {
			var nLayout = node.getLayout();
			var selfwidth = node.getRenderContainer().getWidth() + nodeStyles.main.margin[ 1 ] + nodeStyles.main.margin[ 3 ];
			var childwidth = nLayout.subgroup.getWidth() + nodeStyles.main.margin[ 1 ] + nodeStyles.sub.margin[ 3 ];
			var branchwidth = nLayout.branchwidth = ( selfwidth > childwidth ? selfwidth : childwidth );
			return branchwidth;
		};
		var rootLayout = _root.getLayout();
		var rootbranchwidth = 0;
		for ( var j = 0; j < mainnodes.length; j++ ) {
			rootbranchwidth += countMainWidth( mainnodes[ j ] );
		}
		var sX = rootLayout.x - rootbranchwidth / 2;
		for ( var k = 0; k < mainnodes.length; k++ ) {
			var mLayout = mainnodes[ k ].getLayout();
			mLayout.x = sX + nodeStyles.main.margin[ 3 ] + 5;
			sX += mLayout.branchwidth;
		}
		return mainnodes;
	};
	var updateLayoutAll = function ( node, parent, action ) {
		var effectSet = [];
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var _root = minder.getRoot();
		var rootLayout = _root.getLayout();
		if ( nodeType === "root" ) {
			Layout.x = getMinderSize().width / 2;
			Layout.y = 100;
			Layout.align = "center";
			effectSet.push( node );
			var children = node.getChildren();
			for ( var i = 0; i < children.length; i++ ) {
				var childLayout = children[ i ].getLayout();
				childLayout.y = Layout.y + node.getRenderContainer().getHeight() + nodeStyles.root.margin[ 2 ] + nodeStyles.main.margin[ 0 ];
			}
			effectSet = effectSet.concat( children );
		} else if ( nodeType === "main" ) {
			Layout.align = "left";
			if ( action === "append" || action === "contract" ) {
				Layout.y = rootLayout.y + _root.getRenderContainer().getHeight() + nodeStyles.root.margin[ 2 ] + nodeStyles.main.margin[ 0 ];
			}
			effectSet = updateLayoutMain();
		} else {
			Layout.align = "left";
			var parentLayout = parent.getLayout();
			if ( action === "append" ) {
				if ( parent.getType() === "main" ) {
					Layout.x = nodeStyles.sub.margin[ 3 ];
				} else {
					Layout.x = parentLayout.x + nodeStyles.sub.margin[ 3 ];
				}
			}
			if ( action === "append" || action === "contract" ) {
				Layout.branchheight = node.getRenderContainer().getHeight() + nodeStyles.sub.margin[ 0 ] + nodeStyles.sub.margin[ 2 ];
			}
			var prt = parent;
			if ( action === "change" ) {
				prt = node;
			}
			//自底向上更新branchheight
			while ( prt.getType() !== "main" ) {
				var c = prt.getChildren();
				var prtLayout = prt.getLayout();
				var branchHeight = prt.getRenderContainer().getHeight() + nodeStyles.sub.margin[ 0 ] + nodeStyles.sub.margin[ 2 ];
				for ( var i1 = 0; i1 < c.length; i1++ ) {
					branchHeight += c[ i1 ].getLayout().branchheight;
				}
				prtLayout.branchheight = branchHeight;
				prt = prt.getParent();
			}
			//自顶向下更新y
			var _buffer = [ prt ];
			while ( _buffer.length !== 0 ) {
				var childrenC = _buffer[ 0 ].getChildren();
				_buffer = _buffer.concat( childrenC );
				var _buffer0Layout = _buffer[ 0 ].getLayout();
				var _buffer0Style = nodeStyles[ _buffer[ 0 ].getType() ];
				var sY;
				if ( _buffer[ 0 ].getType() === "main" ) sY = 0;
				else sY = _buffer0Layout.y + _buffer[ 0 ].getRenderContainer().getHeight() + _buffer0Style.margin[ 2 ];
				for ( var s = 0; s < childrenC.length; s++ ) {
					var childLayoutC = childrenC[ s ].getLayout();
					var childStyleC = nodeStyles[ childrenC[ s ].getType() ];
					childLayoutC.y = sY + childStyleC.margin[ 0 ];
					sY += childLayoutC.branchheight;
				}
				effectSet.push( _buffer[ 0 ] );
				_buffer.shift();
			}
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
			nodeShape.setTranslate( Layout.x - _rectWidth, Layout.y );
			break;
		case "center":
			nodeShape.setTranslate( Layout.x - _rectWidth / 2, Layout.y );
			break;
		default:
			nodeShape.setTranslate( Layout.x, Layout.y );
			break;
		}
		if ( node.getType() === "main" ) {
			Layout.subgroup.setTranslate( Layout.x, Layout.y + node.getRenderContainer().getHeight() );
		}
		node.setPoint( Layout.x, Layout.y );
	};
	var updateConnectAndshIcon = function ( node ) {
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var nodeStyle = nodeStyles[ node.getType() ];
		var connect;
		var _root = minder.getRoot();
		var _rootLayout = _root.getLayout();
		//更新连线
		if ( nodeType === "main" ) {
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Path();
				minder.getRenderContainer().addShape( connect );
			}
			connect = Layout.connect;
			var sX = _rootLayout.x;
			var sY = _rootLayout.y + _root.getRenderContainer().getHeight();
			var transX = Layout.x + node.getRenderContainer().getWidth() / 2;
			var transY = sY + nodeStyles.root.margin[ 2 ];
			connect.getDrawer().clear()
				.moveTo( sX, sY )
				.lineTo( sX, transY )
				.lineTo( transX, transY )
				.lineTo( transX, Layout.y );
			connect.stroke( nodeStyles.main.stroke );
		} else if ( nodeType === "sub" ) {
			var parent = node.getParent();
			var parentLayout = parent.getLayout();
			if ( !Layout.connect ) {
				connect = Layout.connect = new kity.Path();
				Layout.subgroup.addShape( connect );
			}
			connect = Layout.connect;
			var ssX, ssY;
			if ( parent.getType() === "main" ) {
				ssX = 10;
				ssY = 0;
			} else {
				ssX = parentLayout.x + 10;
				ssY = parentLayout.y + parent.getRenderContainer().getHeight() + 10;
			}
			var transsY = Layout.y + node.getRenderContainer().getHeight() / 2;
			connect.getDrawer().clear()
				.moveTo( ssX, ssY )
				.lineTo( ssX, transsY )
				.lineTo( Layout.x, transsY );
			connect.stroke( nodeStyles.sub.stroke );
		}
		//更新收放icon
		if ( nodeType !== "root" && node.getChildren().length !== 0 ) {
			if ( !Layout.shicon ) {
				Layout.shicon = new ShIcon( node );
			}
			Layout.shicon.update();
		}
	};
	var _style = {
		getCurrentLayoutStyle: function () {
			return nodeStyles;
		},
		highlightNode: function ( node ) {
			var highlight = node.isHighlight();
			var nodeType = node.getType();
			var nodeStyle = nodeStyles[ nodeType ];
			var Layout = node.getLayout();
			switch ( nodeType ) {
			case "root":
			case "main":
			case "sub":
				if ( highlight ) {
					Layout.bgRect.fill( nodeStyle.highlight );
				} else {
					Layout.bgRect.fill( nodeStyle.fill );
				}
				break;
			default:
				break;
			}
		},
		updateLayout: function ( node ) {
			node.getContRc().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: node
			}, false ) );
			updateShapeByCont( node );
			var set = updateLayoutAll( node, node.getParent(), "change" );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
			if ( node.getType() === "sub" ) {
				var set1 = updateLayoutMain();
				for ( var j = 0; j < set1.length; j++ ) {
					translateNode( set1[ j ] );
					updateConnectAndshIcon( set1[ j ] );
				}
			}
		},
		initStyle: function () {
			var _root = minder.getRoot();
			minder.handelNodeInsert( _root );
			//设置root的align
			_root.getLayout().align = "center";
			updateBg( _root );
			initLayout( _root );
			_root.getContRc().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: _root
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: _root
			}, false ) );
			updateShapeByCont( _root );
			updateLayoutAll( _root );
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
		appendChildNode: function ( parent, node, focus, sibling ) {
			node.clearLayout();
			var parentLayout = parent.getLayout();
			var expand = parent.getData( "expand" );
			//设置分支类型
			if ( parent.getType() === "root" ) {
				node.setType( "main" );
				node.setData( "expand", true );
				minder.handelNodeInsert( node );
			} else {
				node.setType( "sub" );
				//将节点加入到main分支的subgroup中
				parentLayout.subgroup.addShape( node.getRenderContainer() );
				node.getLayout().subgroup = parentLayout.subgroup;
			}
			if ( sibling ) {
				parent.insertChild( node, sibling.getIndex() + 1 );
			} else {
				parent.appendChild( node );
			}
			//计算位置等流程
			updateBg( node );
			initLayout( node );
			// this._fire( new MinderEvent( "beforeRenderNode", {
			// 	node: node
			// }, false ) );
			// this._fire( new MinderEvent( "RenderNode", {
			// 	node: node
			// }, false ) );
			node.getRenderContainer().clear();
			this._firePharse( new MinderEvent( "RenderNodeLeft", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeCenter", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeRight", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeBottom", {
				node: node
			}, false ) );
			this._firePharse( new MinderEvent( "RenderNodeTop", {
				node: node
			}, false ) );
			updateShapeByCont( node );
			var set = updateLayoutAll( node, parent, "append" );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
			if ( node.getType() === "sub" ) {
				var set1 = updateLayoutMain();
				for ( var j = 0; j < set1.length; j++ ) {
					translateNode( set1[ j ] );
					updateConnectAndshIcon( set1[ j ] );
				}
			}
		},
		appendSiblingNode: function ( sibling, node ) {
			var parent = sibling.getParent();
			this.appendChildNode( parent, node, sibling );
		},
		removeNode: function ( nodes ) {
			while ( nodes.length !== 0 ) {
				var parent = nodes[ 0 ].getParent();
				if ( !parent ) {
					nodes.splice( 0, 1 );
					return false;
				}
				var nodeLayout = nodes[ 0 ].getLayout();
				parent.removeChild( nodes[ 0 ] );
				if ( parent.getType() !== "root" && parent.getChildren().length === 0 ) {
					var prtLayout = parent.getLayout();
					prtLayout.shicon.remove();
					prtLayout.shicon = null;
				}
				var set = updateLayoutAll( nodes[ 0 ], parent, "remove" );
				for ( var j = 0; j < set.length; j++ ) {
					translateNode( set[ j ] );
					updateConnectAndshIcon( set[ j ] );
				}
				var set1 = updateLayoutMain();
				for ( var k = 0; k < set1.length; k++ ) {
					translateNode( set1[ k ] );
					updateConnectAndshIcon( set1[ k ] );
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
			var isExpand, node;
			if ( ico instanceof MinderNode ) {
				node = ico;
				isExpand = node.getLayout().shicon.switchState();
			} else {
				isExpand = ico.icon.switchState();
				node = ico.icon._node;
			}
			node.setData( "expand", isExpand );
			var _buffer = node.getChildren();
			var _cleanbuffer = [];

			while ( _buffer.length !== 0 ) {
				var Layout = _buffer[ 0 ].getLayout();
				if ( isExpand ) {
					var parent = _buffer[ 0 ].getParent();
					Layout.parent = parent;
					_cleanbuffer.push( _buffer[ 0 ] );
					Layout.connect = null;
					Layout.shicon = null;
				} else {
					try {
						_buffer[ 0 ].getRenderContainer().remove();
						Layout.connect.remove();
						if ( Layout.shicon ) Layout.shicon.remove();
					} catch ( error ) {}
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
			if ( !isExpand ) set = updateLayoutAll( node, node.getParent(), "contract" );
			for ( var i = 0; i < set.length; i++ ) {
				translateNode( set[ i ] );
				updateConnectAndshIcon( set[ i ] );
			}
		}
	};
	this.addLayoutStyle( "bottom", _style );
	return {};
} );

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

var ViewDragger = kity.createClass( "ViewDragger", {
    constructor: function ( minder ) {
        this._minder = minder;
        this._enabled = false;
        this._offset = {
            x: 0,
            y: 0
        };
        this._bind();
    },
    isEnabled: function () {
        return this._enabled;
    },
    setEnabled: function ( value ) {
        var paper = this._minder.getPaper();
        paper.setStyle( 'cursor', value ? 'pointer' : 'default' );
        paper.setStyle( 'cursor', value ? '-webkit-grab' : 'default' );
        this._enabled = value;
    },
    move: function ( offset ) {
        this._minder.getRenderContainer().translate( offset.x, offset.y );
    },

    _bind: function () {
        var dragger = this,
            isRootDrag = false,
            lastPosition = null,
            currentPosition = null;

        this._minder.on( 'normal.mousedown readonly.mousedown readonly.touchstart', function ( e ) {
            // 点击未选中的根节点临时开启
            if ( e.getTargetNode() == this.getRoot() &&
                ( !this.getRoot().isSelected() || !this.isSingleSelect() ) ) {
                lastPosition = e.getPosition();
                isRootDrag = true;
            }
        } )

        .on('normal.mousemove normal.touchmove', function (e) {
            if (!isRootDrag) return;
            var offset = kity.Vector.fromPoints( lastPosition, e.getPosition());
            if (offset.length() > 3) this.setStatus( 'hand' );
        })

        .on( 'hand.beforemousedown hand.beforetouchend', function ( e ) {
            // 已经被用户打开拖放模式
            if ( dragger.isEnabled() ) {
                lastPosition = e.getPosition();
                e.stopPropagation();
            }
        } )

        .on( 'hand.beforemousemove hand.beforetouchmove', function ( e ) {
            if ( lastPosition ) {
                currentPosition = e.getPosition();

                // 当前偏移加上历史偏移
                var offset = kity.Vector.fromPoints( lastPosition, currentPosition );
                dragger.move( offset );
                e.stopPropagation();
                e.preventDefault();
                e.originEvent.preventDefault();
                lastPosition = currentPosition;
            }
        } )

        .on( 'mouseup', function ( e ) {
            lastPosition = null;

            // 临时拖动需要还原状态
            if ( isRootDrag ) {
                dragger.setEnabled( false );
                isRootDrag = false;
                this.rollbackStatus();
            }
        } );
    }
} );

KityMinder.registerModule( 'View', function () {

    var km = this;

    var ToggleHandCommand = kity.createClass( "ToggleHandCommand", {
        base: Command,
        execute: function ( minder ) {

            minder._viewDragger.setEnabled( !minder._viewDragger.isEnabled() );
            if ( minder._viewDragger.isEnabled() ) {
                minder.setStatus( 'hand' );
            } else {
                minder.rollbackStatus();
            }
            this.setContentChanged( false );

        },
        queryState: function ( minder ) {
            return minder._viewDragger.isEnabled() ? 1 : 0;
        },
        enableReadOnly: false
    } );

    var CameraCommand = kity.createClass( "CameraCommand", {
        base: Command,
        execute: function ( km, focusNode ) {
            var viewport = km.getPaper().getViewPort();
            var offset = focusNode.getRenderContainer().getRenderBox( 'view' );
            var dx = viewport.center.x - offset.x - offset.width / 2,
                dy = viewport.center.y - offset.y;
            km.getRenderContainer().fxTranslate( dx, dy, 1000, "easeOutQuint" );
            this.setContentChanged( false );
        },
        enableReadOnly: false
    } );

    return {
        init: function () {
            this._viewDragger = new ViewDragger( this );
        },
        commands: {
            'hand': ToggleHandCommand,
            'camera': CameraCommand
        },
        events: {
            keyup: function ( e ) {
                if ( e.originEvent.keyCode == keymap.Spacebar && this.getSelectedNodes().length === 0 ) {
                    this.execCommand( 'hand' );
                    e.preventDefault();
                }
            },
            mousewheel: function ( e ) {
                var dx, dy;
                e = e.originEvent;
                if ( e.ctrlKey || e.shiftKey ) return;

                if ( 'wheelDeltaX' in e ) {

                    dx = e.wheelDeltaX || 0;
                    dy = e.wheelDeltaY || 0;

                } else {

                    dx = 0;
                    dy = e.wheelDelta;

                }

                this._viewDragger.move( {
                    x: dx / 2.5,
                    y: dy / 2.5
                } );

                e.preventDefault();
            },
            'normal.dblclick readonly.dblclick': function ( e ) {
                if ( e.kityEvent.targetShape instanceof kity.Paper ) {
                    this.execCommand( 'camera', this.getRoot() );
                }
            }
        }
    };
} );

var GM = KityMinder.Geometry;

// 矩形的变形动画定义
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

var MoveToParentCommand = kity.createClass( 'MoveToParentCommand', {
	base: Command,
	execute: function ( minder, nodes, parent ) {
		var node;
		if ( ( !parent.isExpanded() ) && ( parent.getChildren().length > 0 ) && ( parent.getType() !== 'root' ) ) {
			minder.expandNode( parent );
		}
		for ( var i = nodes.length - 1; i >= 0; i-- ) {
			node = nodes[ i ];
			if ( node.getParent() ) {
				minder.removeNode( [ node ] );
				minder.appendChildNode( parent, node );
				if ( node.isExpanded() && node.getChildren().length !== 0 ) {
					minder.expandNode( node );
				}
			}
		}
		minder.select( nodes, true );
	}
} );


function boxMapper( node ) {
	return node.getRenderContainer().getRenderBox( 'top' );
}

// 对拖动对象的一个替代盒子，控制整个拖放的逻辑，包括：
//    1. 从节点列表计算出拖动部分
//    2. 产生替代矩形包围拖动部分
//    3. 动画收缩替代矩形到固定大小，成为替代盒子
//    4. 控制替代盒子的移动
//    5. 计算可以 drop 的节点，产生 drop 交互提示
var DragBox = kity.createClass( "DragBox", {
	base: kity.Group,


	constructor: function ( minder ) {
		this.callBase();
		this._minder = minder;
		this._draw();
	},

	// 绘制显示拖放范围的矩形和显示拖放信息的文本
	_draw: function () {
		this._rect = new kity.Rect()
			.setRadius( 5 )
			.fill( 'white' )
			.stroke( '#3399ff', 1 );
		this._text = new kity.Text()
			.setSize( 14 )
			.setTextAnchor( 'middle' )
			.fill( 'black' )
			.setStyle( 'cursor', 'default' );
		this.addShapes( [ this._rect, this._text ] );
	},


	// 从选中的节点计算拖放源
	//    并不是所有选中的节点都作为拖放源，如果选中节点中存在 A 和 B，
	//    并且 A 是 B 的祖先，则 B 不作为拖放源
	//    
	//    计算过程：
	//       1. 将节点按照树高排序，排序后只可能是前面节点是后面节点的祖先
	//       2. 从后往前枚举排序的结果，如果发现枚举目标之前存在其祖先，
	//          则排除枚举目标作为拖放源，否则加入拖放源
	_calcDragSources: function () {
		this._dragSources = this._minder.getSelectedAncestors();
	},


	// 计算拖放目标可以释放的节点列表（释放意味着成为其子树），存在这条限制规则：
	//    - 不能拖放到拖放目标的子树上（允许拖放到自身，因为多选的情况下可以把其它节点加入）
	//    
	//    1. 加入当前节点（初始为根节点）到允许列表
	//    2. 对于当前节点的每一个子节点：
	//       (1) 如果是拖放目标的其中一个节点，忽略（整棵子树被剪枝）
	//       (2) 如果不是拖放目标之一，以当前子节点为当前节点，回到 1 计算
	//    3. 返回允许列表
	// 
	_calcDropTargets: function () {

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

		this._dropTargets = findAvailableParents( this._dragSources, this._minder.getRoot() );
		this._dropTargetBoxes = this._dropTargets.map( boxMapper );
	},

	// 进入拖放模式：
	//    1. 计算拖放源和允许的拖放目标
	//    2. 渲染拖放盒子
	//    3. 启动收缩动画
	//    4. 标记已启动
	_enterDragMode: function () {
		this._calcDragSources();
		if ( !this._dragSources.length ) {
			this._startPosition = null;
			return false;
		}
		this._calcDropTargets();
		this._drawForDragMode();
		this._shrink();
		this._dragMode = true;
		return true;
	},
	_leaveDragMode: function () {
		this.remove();
		this._dragMode = false;
		this._dropSucceedTarget = null;
		this._removeDropHint();
	},
	_drawForDragMode: function () {
		this._text.setContent( this._dragSources.length + ' items' );
		this._text.setPosition( this._startPosition.x, this._startPosition.y + 5 );
		this._minder.getPaper().addShape( this );
	},
	_shrink: function () {
		// 合并所有拖放源图形的矩形即可
		function calcSourceArea( boxArray ) {
			var area = boxArray.pop();
			while ( boxArray.length ) {
				area = GM.mergeBox( area, boxArray.pop() );
			}
			return {
				x: area.left,
				y: area.top,
				width: area.width,
				height: area.height
			};
		}
		// 从焦点发散出一个固定的矩形即可
		function calcFocusArea( focusPoint ) {
			var width = 80,
				height = 30;
			return {
				x: focusPoint.x - width / 2,
				y: focusPoint.y - height / 2,
				width: width,
				height: height
			};
		}

		var sourceArea = calcSourceArea( this._dragSources.map( boxMapper ) );
		var focusArea = calcFocusArea( this._startPosition );
		var animator = new AreaAnimator( sourceArea, focusArea );
		animator.start( this._rect, 400, 'easeOutQuint' );
	},
	// 此处可用线段树优化，但考虑到节点不多，必要性不到，就用暴力测试
	_dropTest: function () {
		var dragBox = this.getRenderBox(),
			test;

		this._dropSucceedTarget = null;
		for ( var i = 0; i < this._dropTargetBoxes.length; i++ ) {
			test = this._dropTargetBoxes[ i ];
			if ( GM.isBoxIntersect( dragBox, test ) ) {
				this._dropSucceedTarget = this._dropTargets[ i ];
				return;
			}
		}
	},
	_updateDropHint: function () {
		var target = this._dropSucceedTarget,
			lastTarget = this._lastSucceedTarget;
		if ( target && target == lastTarget ) return;
		if ( lastTarget ) {
			this._removeDropStyle( lastTarget );
		}
		if ( target ) {
			this._addDropStyle( target );
		}
		this._lastSucceedTarget = target;
	},

	_removeDropHint: function () {
		var lastTarget = this._lastSucceedTarget;
		if ( lastTarget ) {
			this._removeDropStyle( lastTarget );
		}
	},

	_removeDropStyle: function ( node ) {
		node._layout.bgRect.stroke( 'none' );
		this._rect.stroke( '#3399ff', 1 );
	},

	_addDropStyle: function ( node ) {
		node._layout.bgRect.stroke( 'rgb(254, 219, 0)', 3 );
		node.getRenderContainer().fxScale( 1.25, 1.25, 150, 'ease' ).fxScale( 0.8, 0.8, 150, 'ease' );
	},

	dragStart: function ( position ) {
		// 只记录开始位置，不马上开启拖放模式
		// 这个位置同时是拖放范围收缩时的焦点位置（中心）
		this._startPosition = position;
	},

	dragMove: function ( position ) {
		// 启动拖放模式需要最小的移动距离
		var DRAG_MOVE_THRESHOLD = 10;

		if ( !this._startPosition ) return;

		this._dragPosition = position;

		if ( !this._dragMode ) {
			// 判断拖放模式是否该启动
			if ( GM.getDistance( this._dragPosition, this._startPosition ) < DRAG_MOVE_THRESHOLD ) {
				return;
			}
			if ( !this._enterDragMode() ) {
				return;
			}
		}

		var movement = kity.Vector.fromPoints( this._startPosition, this._dragPosition );

		this.setTranslate( movement );

		this._dropTest();
		this._updateDropHint();
	},

	dragEnd: function () {
		this._startPosition = null;
		if ( !this._dragMode ) {
			return;
		}
		if ( this._dropSucceedTarget ) {
			this._minder.execCommand( 'movetoparent', this._dragSources, this._dropSucceedTarget );
		}
		this._leaveDragMode();
	}

} );

KityMinder.registerModule( "DragTree", function () {
	var dragStartPosition, dragBox, dragTargets, dropTargets, dragTargetBoxes, dropTarget;

	return {
		init: function () {
			this._dragBox = new DragBox( this );
		},
		events: {
			mousedown: function ( e ) {
				// 单选中根节点也不触发拖拽
				if ( e.getTargetNode() && e.getTargetNode() != this.getRoot() ) {
					this._dragBox.dragStart( e.getPosition() );
				}
			},
			'mousemove': function ( e ) {
				this._dragBox.dragMove( e.getPosition() );
			},
			'mouseup': function ( e ) {
				this._dragBox.dragEnd();
			}
		},
		commands: {
			'movetoparent': MoveToParentCommand
		}
	};
} );

KityMinder.registerModule( "DropFile", function () {

	var social,
		draftManager,
		importing = false;

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

		if ( kity.Browser.ie && Number( kity.Browser.version ) < 10 ) {
			alert( '文件导入对IE浏览器仅支持10以上版本' );
			return;
		}

		var files = e.dataTransfer.files;

		if ( files ) {
			var file = files[ 0 ];
			var ext = file.type || ( /(.)\w+$/ ).exec( file.name )[ 0 ];

			if ( ( /xmind/g ).test( ext ) ) { //xmind zip
				importSync( minder, file, 'xmind' );
			} else if ( ( /mmap/g ).test( ext ) ) { // mindmanager zip
				importSync( minder, file, 'mindmanager' );
			} else if ( ( /mm/g ).test( ext ) ) { //freemind xml
				importAsync( minder, file, 'freemind' );
			} else { // txt json
				importAsync( minder, file );
			}
		}
	}

	function afterImport() {
		if ( !importing ) return;
		createDraft( this );
		social.setRemotePath( null, false );
		this.execCommand( 'camera', this.getRoot() );
		setTimeout( function () {
			social.watchChanges( true );
		}, 10 );
		importing = false;
	}

	// 同步加载文件
	function importSync( minder, file, protocal ) {
		social = social || window.social;
		social.watchChanges( false );
		importing = true;
		minder.importData( file, protocal ); //zip文件的import是同步的
	}

	// 异步加载文件
	function importAsync( minder, file, protocal ) {
		var reader = new FileReader();
		reader.onload = function ( e ) {
			importSync( minder, e.target.result, protocal );
		};
		reader.readAsText( file );
	}

	function createDraft( minder ) {
		draftManager = window.draftManager || ( window.draftManager = new window.DraftManager( minder ) );
		draftManager.create();
	}

	return {
		events: {
			'ready': init,
			'import': afterImport
		}
	};
} );

KityMinder.registerModule( "KeyboardModule", function () {
    var min = Math.min,
        max = Math.max,
        abs = Math.abs,
        sqrt = Math.sqrt,
        exp = Math.exp;

    function buildPositionNetwork( root ) {
        var pointIndexes = [],
            p;
        root.traverse( function ( node ) {
            p = node.getRenderContainer().getRenderBox( 'top' );
            pointIndexes.push( {
                left: p.x,
                top: p.y,
                right: p.x + p.width,
                bottom: p.y + p.height,
                width: p.width,
                height: p.height,
                node: node,
                text: node.getText()
            } );
        } );
        for ( var i = 0; i < pointIndexes.length; i++ ) {
            findClosestPointsFor( pointIndexes, i );
        }
    }


    // 这是金泉的点子，赞！
    // 求两个不相交矩形的最近距离
    function getCoefedDistance( box1, box2 ) {
        var xMin, xMax, yMin, yMax, xDist, yDist, dist, cx, cy;
        xMin = min( box1.left, box2.left );
        xMax = max( box1.right, box2.right );
        yMin = min( box1.top, box2.top );
        yMax = max( box1.bottom, box2.bottom );

        xDist = xMax - xMin - box1.width - box2.width;
        yDist = yMax - yMin - box1.height - box2.height;

        if ( xDist < 0 ) dist = yDist;
        else if ( yDist < 0 ) dist = xDist;
        else dist = sqrt( xDist * xDist + yDist * yDist );

        return {
            cx: dist,
            cy: dist
        };
    }

    function findClosestPointsFor( pointIndexes, iFind ) {
        var find = pointIndexes[ iFind ];
        var most = {}, quad;
        var current, dist;

        for ( var i = 0; i < pointIndexes.length; i++ ) {
            if ( i == iFind ) continue;
            current = pointIndexes[ i ];
            dist = getCoefedDistance( current, find );

            // left check
            if ( current.right < find.left ) {
                if ( !most.left || dist.cx < most.left.dist ) {
                    most.left = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // right check
            if ( current.left > find.right ) {
                if ( !most.right || dist.cx < most.right.dist ) {
                    most.right = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // top check
            if ( current.bottom < find.top ) {
                if ( !most.top || dist.cy < most.top.dist ) {
                    most.top = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }

            // bottom check
            if ( current.top > find.bottom ) {
                if ( !most.down || dist.cy < most.down.dist ) {
                    most.down = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }
        }
        find.node._nearestNodes = {
            right: most.right && most.right.node || null,
            top: most.top && most.top.node || null,
            left: most.left && most.left.node || null,
            down: most.down && most.down.node || null
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
            "normal.keydown": function ( e ) {

                var keys = KityMinder.keymap;

                var node = e.getTargetNode();
                this.receiver.keydownNode = node;
                switch ( e.originEvent.keyCode ) {
                case keys.Enter:
                    this.execCommand( 'appendSiblingNode', new MinderNode( this.getLang().topic ), true );
                    e.preventDefault();
                    break;
                case keys.Tab:
                    this.execCommand( 'appendChildNode', new MinderNode( this.getLang().topic ), true );
                    e.preventDefault();
                    break;
                case keys.Backspace:
                case keys.Del:
                    e.preventDefault();
                    this.execCommand( 'removenode' );
                    break;
                case keys.F2:
                    e.preventDefault();
                    this.execCommand( 'editnode' );
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

    // 在实例上渲染框选矩形、计算框选范围的对象
    var marqueeActivator = ( function () {

        // 记录选区的开始位置（mousedown的位置）
        var startPosition = null;

        // 选区的图形
        var marqueeShape = new kity.Path().fill( 'rgba(255,255,255,.3)' ).stroke( 'white' );

        // 标记是否已经启动框选状态
        //    并不是 mousedown 发生之后就启动框选状态，而是检测到移动了一定的距离（MARQUEE_MODE_THRESHOLD）之后
        var marqueeMode = false;
        var MARQUEE_MODE_THRESHOLD = 10;

        return {
            selectStart: function ( e ) {
                // 只接受左键
                if ( e.originEvent.button ) return;

                // 清理不正确状态
                if ( startPosition ) {
                    return this.selectEnd();
                }

                startPosition = g.snapToSharp( e.getPosition() );
            },
            selectMove: function ( e ) {
                if ( minder.isTextEditStatus() ) {
                    return;
                }
                if ( !startPosition ) return;

                var p1 = startPosition,
                    p2 = e.getPosition();

                // 检测是否要进入选区模式
                if ( !marqueeMode ) {
                    // 距离没达到阈值，退出
                    if ( g.getDistance( p1, p2 ) < MARQUEE_MODE_THRESHOLD ) {
                        return;
                    }
                    // 已经达到阈值，记录下来并且重置选区形状
                    marqueeMode = true;
                    minder.getPaper().addShape( marqueeShape );
                    marqueeShape.setOpacity( 0.8 ).getDrawer().clear();
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

                // 计算选中范围
                minder.getRoot().traverse( function ( node ) {
                    var renderBox = node.getRenderContainer().getRenderBox( "top" );
                    if ( g.isBoxIntersect( renderBox, marquee ) ) {
                        selectedNodes.push( node );
                    }
                } );

                // 应用选中范围
                minder.select( selectedNodes, true );
            },
            selectEnd: function ( e ) {
                if ( startPosition ) {
                    startPosition = null;
                }
                if ( marqueeMode ) {
                    marqueeShape.fadeOut( 200, 'ease', 0, function () {
                        if ( marqueeShape.remove ) marqueeShape.remove();
                    } );
                    marqueeMode = false;
                }
            }
        };
    } )();

    var lastDownNode = null;
    return {
        "events": {
            "normal.mousedown textedit.mousedown": function ( e ) {
                var downNode = e.getTargetNode();

                // 没有点中节点：
                //     清除选中状态，并且标记选区开始位置
                if ( !downNode ) {
                    this.removeAllSelectedNodes();
                    marqueeActivator.selectStart( e );

                    this.setStatus('normal')
                }

                // 点中了节点，并且按了 shift 键：
                //     被点中的节点切换选中状态
                else if ( e.originEvent.shiftKey ) {
                    this.toggleSelect( downNode );
                }

                // 点中的节点没有被选择：
                //     单选点中的节点
                else if ( !downNode.isSelected() ) {
                    this.select( downNode, true );
                }

                // 点中的节点被选中了，并且不是单选：
                //     完成整个点击之后需要使其变为单选。
                //     不能马上变为单选，因为可能是需要拖动选中的多个节点
                else if ( !this.isSingleSelect() ) {
                    lastDownNode = downNode;
                }
            },
            "normal.mousemove textedit.mousemove": marqueeActivator.selectMove,
            "normal.mouseup textedit.mouseup": function ( e ) {
                var upNode = e.getTargetNode();

                // 如果 mouseup 发生在 lastDownNode 外，是无需理会的
                if ( upNode && upNode == lastDownNode ) {
                    this.select( lastDownNode, true );
                    lastDownNode = null;
                }

                // 清理一下选择状态
                marqueeActivator.selectEnd( e );
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



    km.isTextEditStatus = function(){
        return km.receiver.isTextEditStatus();
    };

    km.textEditNode = function(node){

        var textShape = node.getTextShape();
        this.setStatus('textedit');
        sel.setHide();
        sel.setStartOffset(0);
        sel.setEndOffset(textShape.getContent().length);

        receiver.setTextEditStatus(true)
            .setSelection(sel)
            .setKityMinder(this)
            .setMinderNode(node)
            .setTextShape(textShape)
            .setRange(range)
            .setBaseOffset()
            .setContainerStyle()
            .setSelectionHeight()
            .setContainerTxt(textShape.getContent())
            .updateTextData()
            .updateSelectionShow()
            .updateRange(range).setTextEditStatus(true);


        sel.setData('relatedNode',node);
    };
    var selectionByClick = false;

    var dragmoveTimer;
    return {
        "events": {
            //插入光标
            "afterinitstyle":function(){
                this.getRenderContainer().addShape(sel);
            },
            'normal.beforemousedown textedit.beforemousedown':function(e){
                if(e.isRightMB()){
                    e.stopPropagationImmediately();
                    return;
                }
                sel.setHide();
                var node = e.getTargetNode();
                if(!node){
                    var selectionShape = e.kityEvent.targetShape;
                    if(selectionShape && selectionShape.getType() == 'Selection'){
                        selectionByClick = true;
                        node = selectionShape.getData('relatedNode');
                        e.stopPropagationImmediately();
                    }
                    if(this.getStatus() == 'textedit')
                        this.fire('contentchange');
                    km.setStatus('normal')
                }
                if(node){
                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor','default');

                    if ( this.isSingleSelect() && node.isSelected()) {// && e.kityEvent.targetShape.getType().toLowerCase()== 'text'

                        sel.collapse();
                        node.getTextShape().setStyle('cursor','text');
                        km.setStatus('textedit');
                        receiver.setTextEditStatus(true)
                            .setSelection(sel)
                            .setKityMinder(this)
                            .setMinderNode(node)
                            .setTextShape(textShape)
                            .setBaseOffset()
                            .setContainerStyle()
                            .setSelectionHeight()
                            .setCurrentIndex(e.getPosition(this.getRenderContainer()))
                            .updateSelection()
                            .setRange(range);
                        sel.setData('relatedNode',node);
                        mouseDownStatus = true;
                        lastEvtPosition = e.getPosition();
                        if(selectionByClick){
                            sel.setShow();
                            selectionByClick = false;
                        }
                        km.setStatus('textedit');
                    }
                }
            },
            //当输入键值是内容时，进入textedit状态
            'normal.beforekeydown':function(e){
                var node = this.getSelectedNode();
                if(node){
                    if ( this.isSingleSelect() && node.isSelected()) {
                        var keyCode = e.originEvent.keyCode;
                        if(!keymap.notContentInput[keyCode] && range.nativeSel.rangeCount != 0){
                            var nativeRange = range.nativeSel.getRangeAt(0);
                            if(nativeRange && (nativeRange.startContainer === receiver.container || receiver.container.contains(nativeRange.startContainer )))
                                km.setStatus('textedit')
                        }
                    }
                }
            },
            //当节点选区通过键盘发生变化时，输入状态要准备好
            'normal.keyup':function(e){
                var node = this.getSelectedNode();
                if(node){
                    if ( this.isSingleSelect() && node.isSelected()) {
                        var keyCode = e.originEvent.keyCode;
                        if(keymap.isSelectedNodeKey[keyCode] && km.getStatus() != 'textedit'){
                           //准备输入状态
                            var textShape = node.getTextShape();

                            sel.setHide();
                            sel.setStartOffset(0);
                            sel.setEndOffset(textShape.getContent().length);

                            receiver.setTextEditStatus(true)
                                .setSelection(sel)
                                .setKityMinder(this)
                                .setMinderNode(node)
                                .setTextShape(textShape)
                                .setRange(range)
                                .setBaseOffset()
                                .setContainerStyle()
                                .setSelectionHeight()
                                .setContainerTxt(textShape.getContent())
                                .updateRange(range).setTextEditStatus(true);

                            sel.setData('relatedNode',node);
                        }
                    }
                }
            },
            'normal.mouseup textedit.mouseup':function(e){

                if(mouseDownStatus){
                    if(!sel.collapsed ){

                        try{
                            receiver.updateRange(range)
                        }catch(e){
                            console.log(e)
                        }

                    }else
                       sel.setShow()
                }else{
                    //当选中节点后，输入状态准备
                    var node = e.getTargetNode();
                    if(node){
                        if ( this.isSingleSelect() && node.isSelected()) {
                            //准备输入状态
                            var textShape = node.getTextShape();

                            sel.setHide();
                            sel.setStartOffset(0);
                            sel.setEndOffset(textShape.getContent().length);

                            receiver.setTextEditStatus(true)
                                .setSelection(sel)
                                .setKityMinder(this)
                                .setMinderNode(node)
                                .setTextShape(textShape)
                                .setRange(range)
                                .setBaseOffset()
                                .setContainerStyle()
                                .setSelectionHeight()
                                .setContainerTxt(textShape.getContent())
                                .updateRange(range).setTextEditStatus(true);

                            sel.setData('relatedNode',node);

                        }
                    }
                }


                mouseDownStatus = false;
                oneTime = 0;
            },
            'textedit.beforemousemove':function(e){
                if(mouseDownStatus){
                    e.stopPropagationImmediately();

                    var offset = e.getPosition(this.getRenderContainer());
                    if(Math.abs(offset.y - lastEvtPosition.y) >= 2 && Math.abs(lastEvtPosition.x - offset.x) <= 2 ){
                        sel.setHide();
                        mouseDownStatus = false;
                        return;
                    }
                    dir = offset.x > lastEvtPosition.x  ? 1 : (offset.x  < lastEvtPosition.x ? -1 : dir);
                    receiver.updateSelectionByMousePosition(offset,dir)
                        .updateSelectionShow(dir);

                    lastEvtPosition = e.getPosition();

                }
            },
            'normal.dblclick textedit.dblclick':function(e){

                var text =  e.kityEvent.targetShape;
                if ( text.getType().toLowerCase()== 'text') {

                    sel.setStartOffset(0);
                    sel.setEndOffset(text.getContent().length);
                    sel.setShow();
                    receiver.setContainerTxt(text.getContent()).updateSelectionShow(1)
                        .updateRange(range).setTextEditStatus(true);
                    km.setStatus('textedit');
                }
            },
            'restoreScene':function(){
                sel.setHide();
            },
            'stopTextEdit':function(){
                sel.setHide();
                receiver.clear().setTextEditStatus(false);
                km.setStatus('normal');
            },
            "resize": function ( e ) {
                sel.setHide();
            },
            "execCommand": function( e ) {
                var cmds = {
                    'appendchildnode' : 1,
                    'appendsiblingnode' : 1,
                    'editnode' : 1
                };
                if ( cmds[ e.commandName ] ){

                    var node = km.getSelectedNode();
                    if( !node ){
                        return;
                    }

                    var textShape = node.getTextShape();

                    textShape.setStyle('cursor','default');
                    node.getTextShape().setStyle('cursor','text');
                    km.setStatus('textedit');
                    receiver.setTextEditStatus(true)
                        .setSelection(sel)
                        .setKityMinder(this)
                        .setMinderNode(node)
                        .setTextShape(textShape)
                        .setBaseOffset()
                        .setContainerStyle()
                        .setSelectionHeight()
                        .getTextOffsetData()
                        .setIndex(0)
                        .updateSelection()
                        .setRange(range);

                    sel.setStartOffset(0);
                    sel.setEndOffset(textShape.getContent().length);
                    sel.setShow();

                    receiver.updateSelectionShow(1)
                        .updateRange(range);
                    return;

                }

                if((e.commandName == 'priority' || e.commandName == 'progress') && this.getStatus() == 'textedit' ){

                    receiver.setBaseOffset()
                        .getTextOffsetData();

                    if(sel.collapsed){
                        receiver.updateSelection();
                    }else{
                        receiver.updateSelectionShow(1)
                    }
                    return;


                }
                receiver.clear().setTextEditStatus(false);
                if(this.getStatus() == 'textedit'){
                    this.setStatus('normal')
                }
            },
            'selectionclear':function(){
                km.setStatus('normal');
                receiver.setTextEditStatus(false).clear()
            },
            blur:function(){
                receiver.clear()
            },
            'textedit.mousewheel':function(){
                receiver.setContainerStyle()
            }
        }
    };
} );

Minder.Range = kity.createClass('Range',{
    constructor : function(){
        this.nativeRange = document.createRange();
        this.nativeSel = window.getSelection();
    },
    hasNativeRange : function(){
        return this.nativeSel.rangeCount != 0 ;
    },
    select:function(){
        var start = this.nativeRange.startContainer;
        if(start.nodeType == 1 && start.childNodes.length == 0){
            var char = document.createTextNode('\u200b');
            start.appendChild(char);
            this.nativeRange.setStart(char,1);
            this.nativeRange.collapse(true);
        }
        try{
            this.nativeSel.removeAllRanges();
        }catch(e){

        }

        this.nativeSel.addRange(this.nativeRange);
        return this;
    },
    setStart:function(node,index){
        try{
            this.nativeRange.setStart(node,index);
        }catch(e){
            console.log('e')
        }

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
    },
    updateNativeRange:function(){

        this.nativeRange = this.nativeSel.getRangeAt(0);
        return this;
    }
});

//接收者
Minder.Receiver = kity.createClass( 'Receiver', {
    clear: function () {
        this.container.innerHTML = '';
        this.selection && this.selection.setHide();
        this.range && this.range.nativeSel.removeAllRanges();
        this.index = 0;
        this.inputLength = 0;
        return this;
    },
    setTextEditStatus: function ( status ) {
        this.textEditStatus = status || false;
        return this;
    },
    isTextEditStatus: function () {
        return this.textEditStatus;
    },
    constructor: function ( km ) {
        var me = this;
        this.setKityMinder( km );
        this.textEditStatus = false;
        var _div = document.createElement( 'div' );
        _div.setAttribute( 'contenteditable', true );
        _div.className = 'km_receiver';
        this.container = document.body.insertBefore( _div, document.body.firstChild );
        if ( browser.ie && browser.version == 11 ) {
            utils.listen( this.container, 'keydown keypress keyup', function ( e ) {
                me.keyboardEvents.call( me, new MinderEvent( e.type == 'keyup' ? "beforekeyup" : e.type, e ) )
            } )
        }
        utils.addCssRule( 'km_receiver_css', ' .km_receiver{position:absolute;padding:0;margin:0;word-wrap:break-word;clip:rect(1em 1em 1em 1em);}' ); //
        this.km.on( 'textedit.beforekeyup textedit.keydown textedit.keypress textedit.paste', utils.proxy( this.keyboardEvents, this ) );
        this.timer = null;
        this.index = 0;
    },
    setRange: function ( range, index ) {

        this.index = index || this.index;

        var text = this.container.firstChild;
        this.range = range;
        range.setStart( text || this.container, this.index ).collapse( true );
        var me = this;
        setTimeout( function () {
            me.container.focus();
            range.select()
        } );
        return this;
    },
    setTextShape: function ( textShape ) {
        if ( !textShape ) {
            textShape = new kity.Text();
        }
        this.textShape = textShape;
        this.container.innerHTML = utils.unhtml( textShape.getContent() );
        return this;
    },
    setTextShapeSize: function ( size ) {
        this.textShape.setSize( size );
        return this;
    },
    getTextShapeHeight: function () {
        return this.textShape.getRenderBox().height;
    },
    appendTextShapeToPaper: function ( paper ) {
        paper.addShape( this.textShape );
        return this;
    },
    setKityMinder: function ( km ) {
        this.km = km;
        return this;
    },
    setMinderNode: function ( node ) {
        this.minderNode = node;
        return this;
    },
    keyboardEvents: function ( e ) {

        clearTimeout( this.timer );
        var me = this;
        var orgEvt = e.originEvent;
        var keyCode = orgEvt.keyCode;
        var keys = KityMinder.keymap;

        function setTextToContainer() {
            if(!me.range.hasNativeRange()){
                return;
            }
            var text = me.container.textContent.replace( /[\u200b\t\r\n]/g, '' );

            if ( me.textShape.getOpacity() == 0 ) {
                me.textShape.setOpacity( 1 );
            }
            //#46 修复在ff下定位到文字后方空格光标不移动问题
            if ( browser.gecko && /\s$/.test( text ) ) {
                text += "\u200b";
            }
            me.textShape.setContent( text );
            me.setContainerStyle();
            me.minderNode.setText( text );
            if ( text.length == 0 ) {
                me.minderNode.setText( 'a' );
            }
            me.km.updateLayout( me.minderNode );


            me.textShape = me.minderNode.getTextShape();
            if ( text.length == 0 ) {
                me.textShape.setOpacity( 0 );
            }
            me.setBaseOffset();
            me.updateTextData();

            me.updateIndex();
            me.updateSelection();

            me.timer = setTimeout( function () {
                me.selection.setShow()
            }, 500 );
        }
        var isTypeText = false;
        var isKeypress = false;
        switch ( e.type ) {

        case 'keydown':

            isTypeText = false;
            isKeypress = false;
            switch ( e.originEvent.keyCode ) {
            case keys.Enter:
            case keys.Tab:
                this.selection.setHide();
                this.clear().setTextEditStatus( false );
                this.km.fire( 'contentchange' );
                this.km.setStatus( 'normal' );
                e.preventDefault();
                return;
                break;
            case keymap.Shift:
            case keymap.Control:
            case keymap.Alt:
            case keymap.Cmd:
                return;
            }

            if ( e.originEvent.ctrlKey || e.originEvent.metaKey ) {

                //粘贴
                if ( keyCode == keymap.v ) {

                    setTimeout( function () {
                        me.range.updateNativeRange().insertNode( $( '<span>$$_kityminder_bookmark_$$</span>' )[ 0 ] );
                        me.container.innerHTML = utils.unhtml( me.container.textContent.replace( /[\u200b\t\r\n]/g, '' ) );
                        var index = me.container.textContent.indexOf( '$$_kityminder_bookmark_$$' );
                        me.container.textContent = me.container.textContent.replace( '$$_kityminder_bookmark_$$', '' );
                        me.range.setStart( me.container.firstChild, index ).collapse( true ).select();
                        setTextToContainer()
                    }, 100 );
                }
                //剪切
                if ( keyCode == keymap.x ) {
                    setTimeout( function () {
                        setTextToContainer()
                    }, 100 );
                }
                return;
            }
            isTypeText = true;

            break;



        case 'keypress':

            if ( isTypeText )
                setTextToContainer();
            isKeypress = true;
            break;

        case 'beforekeyup':
            switch ( keyCode ) {
            case keymap.Enter:
            case keymap.Tab:
            case keymap.F2:
                if ( this.keydownNode === this.minderNode ) {
                    this.rollbackStatus();
                    this.setTextEditStatus( false );
                    this.clear();
                }
                e.preventDefault();
                return;


            }

            if ( !isKeypress ) {
                setTextToContainer();
            }
            return true;
        }


    },

    updateIndex: function () {
        this.index = this.range.getStart().startOffset;
        return this;
    },
    updateTextData: function () {
        this.textShape.textData = this.getTextOffsetData();
        return this;
    },
    setSelection: function ( selection ) {
        this.selection = selection;
        return this;
    },
    updateSelection: function () {
        this.selection.setShowHold();
        this.selection.bringTop();
        //更新模拟选区的范围
        this.selection.setStartOffset( this.index ).collapse( true );
        if ( this.index == this.textData.length ) {
            if ( this.index == 0 ) {
                this.selection.setPosition( this.getBaseOffset() )
            } else {
                this.selection.setPosition( {
                    x: this.textData[ this.index - 1 ].x + this.textData[ this.index - 1 ].width,
                    y: this.textData[ this.index - 1 ].y
                } )
            }


        } else {
            this.selection.setPosition( this.textData[ this.index ] )
        }
        return this;
    },
    getBaseOffset: function ( refer ) {
        var rb = this.textShape.getRenderBox( refer || this.km.getRenderContainer() );
        //        if(!this.pr) {
        //            this.km.getRenderContainer().addShape(this.pr = new kity.Rect().stroke('green'));
        //        }
        //        this.pr.setSize(rb.width, rb.height).setPosition(rb.x, rb.y);
        return rb;
    },
    setBaseOffset: function () {
        this.offset = this.textShape.getRenderBox( this.km.getRenderContainer() );
        return this;
    },
    setContainerStyle: function () {
        var textShapeBox = this.getBaseOffset( 'screen' );
        this.container.style.cssText = ";left:" + textShapeBox.x + 'px;top:' + ( textShapeBox.y - 5 ) + 'px;width:' + textShapeBox.width + 'px;height:' + textShapeBox.height + 'px;';

        if ( !this.selection.isShow() ) {
            var paperContainer = this.km.getPaper();
            var width = paperContainer.node.parentNode.clientWidth;
            var height = paperContainer.node.parentNode.clientHeight;
            if ( width < this.container.offsetWidth + this.container.offsetLeft ) {
                this.km.getRenderContainer().translate( width / -3, 0 );
                this.setContainerStyle();
            } else if ( height < this.container.offsetTop + this.container.offsetHeight ) {
                this.km.getRenderContainer().translate( 0, height / -3 );
                this.setContainerStyle()
            }
        }


        return this;
    },
    getTextOffsetData: function () {
        var text = this.textShape.getContent();
        this.textData = [];

        for ( var i = 0, l = text.length; i < l; i++ ) {
            try {
                var box = this.textShape.getExtentOfChar( i );
            } catch ( e ) {
                console.log( e )
            }

            this.textData.push( {
                x: box.x + this.offset.x,
                y: this.offset.y,
                width: box.width,
                height: box.height
            } )
        }
        return this;
    },
    setCurrentIndex: function ( offset ) {
        var me = this;
        this.getTextOffsetData();
        var hadChanged = false;
        utils.each( this.textData, function ( i, v ) {
            //点击开始之前
            if ( i == 0 && offset.x <= v.x ) {
                me.index = 0;
                return false;
            }
            if ( offset.x >= v.x && offset.x <= v.x + v.width ) {
                if ( offset.x - v.x > v.width / 2 ) {
                    me.index = i + 1;

                } else {
                    me.index = i

                }
                hadChanged = true;
                return false;
            }
            if ( i == me.textData.length - 1 && offset.x >= v.x ) {
                me.index = me.textData.length;
                return false;
            }
        } );

        return this;

    },
    setSelectionHeight: function () {
        this.selection.setHeight( this.getTextShapeHeight() );
        return this;
    },

    updateSelectionByMousePosition: function ( offset, dir ) {

        var me = this;
        utils.each( this.textData, function ( i, v ) {
            //点击开始之前
            if ( i == 0 && offset.x <= v.x ) {
                me.selection.setStartOffset( 0 );
                return false;
            }

            if ( i == me.textData.length - 1 && offset.x >= v.x ) {
                me.selection.setEndOffset( me.textData.length );
                return false;
            }
            if ( offset.x >= v.x && offset.x <= v.x + v.width ) {

                if ( me.index == i ) {
                    if ( i == 0 ) {
                        me.selection.setStartOffset( i )
                    }
                    if ( offset.x <= v.x + v.width / 2 ) {
                        me.selection.collapse()
                    } else {
                        me.selection.setEndOffset( i + ( ( me.selection.endOffset > i || dir == 1 ) && i != me.textData.length - 1 ? 1 : 0 ) )
                    }

                } else if ( i > me.index ) {
                    me.selection.setStartOffset( me.index );
                    me.selection.setEndOffset( i + 1 )
                } else {
                    if ( dir == 1 ) {
                        me.selection.setStartOffset( i + ( offset.x >= v.x + v.width / 2 && i != me.textData.length - 1 ? 1 : 0 ) );
                    } else {
                        me.selection.setStartOffset( i );
                    }

                    me.selection.setEndOffset( me.index )
                }

                return false;
            }
        } );
        return this;
    },
    updateSelectionShow: function () {
        var startOffset = this.textData[ this.selection.startOffset ],
            endOffset = this.textData[ this.selection.endOffset ],
            width = 0;
        if ( this.selection.collapsed ) {
            this.selection.updateShow( startOffset || this.textData[ this.textData.length - 1 ], 1 );
            return this;
        }
        if ( !endOffset ) {
            try {
                var lastOffset = this.textData[ this.textData.length - 1 ];
                width = lastOffset.x - startOffset.x + lastOffset.width;
            } catch ( e ) {
                console.log( 'e' )
            }

        } else {
            width = endOffset.x - startOffset.x;
        }

        this.selection.updateShow( startOffset, width );
        return this;
    },
    updateRange: function ( range ) {
        var node = this.container.firstChild;
        range.setStart( node, this.selection.startOffset );
        range.setEnd( node, this.selection.endOffset );
        range.select();
        return this;
    },
    setIndex: function ( index ) {
        this.index = index;
        return this
    },
    setContainerTxt: function ( txt ) {
        this.container.textContent = txt;
        return this;
    }
} );

//模拟光标
Minder.Selection = kity.createClass( 'Selection', {
    base: kity.Rect,
    constructor: function ( height, color, width ) {
        this.callBase();
        this.height = height || 20;
        this.setAttr('id','_kity_selection');
        this.stroke( color || 'rgb(27,171,255)', width || 1 );
        this.width = 0;
        this.fill('rgb(27,171,255)');
        this.setHide();
        this.timer = null;
        this.collapsed = true;
        this.startOffset = this.endOffset = 0;
        this.setOpacity(0.5);
        this.setStyle('cursor','text');
        this._show = false;
    },
    collapse : function(toEnd){

        this.stroke( 'rgb(27,171,255)', 1 );
        this.setOpacity(1);
        this.width = 1;
        this.collapsed = true;
        if(toEnd){
            this.startOffset = this.endOffset;
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
        this.stroke('none',0);
        this.setOpacity(0.5);
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
        this.stroke('none',0);
        this.setOpacity(0.5);
        return this;
    },
    updateShow : function(offset,width){
        if(width){
            this.setShowHold();
        }
        this.setPosition(offset).setWidth(width);
        //解决在框选内容时，出现很窄的光标
        if(width == 0){
            this.setOpacity(0);
        }else{
            this.setOpacity(0.5);
        }
        this.bringTop();
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
        this._show = false;
        return this;
    },
    setShowHold: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', '' );
        this._show = true;
        return this;
    },
    setShow: function () {
        clearInterval( this.timer );
        var me = this,
            state = '';
        me.setStyle( 'display', '' );
        me._show = true;
        if(this.collapsed){
            me.setOpacity(1);
            this.timer = setInterval( function () {
                me.setStyle( 'display', state );
                state = state ? '' : 'none';
            }, 400 );
        }

        return this;
    },
    isShow:function(){
        return this._show;
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

                execute: function () {

                    var nodes = km.getSelectedNodes();
                    if ( this.queryState( 'bold' ) == 1 ) {
                        utils.each( nodes, function ( i, n ) {
                            n.setData( 'bold' );
                            n.getTextShape().setAttr( 'font-weight' );
                            km.updateLayout( n )
                        } )
                    } else {
                        utils.each( nodes, function ( i, n ) {
                            n.setData( 'bold', true );
                            n.getTextShape().setAttr( 'font-weight', 'bold' );
                            km.updateLayout( n )
                        } )
                    }
                },
                queryState: function () {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if ( nodes.length == 0 ) {
                        return -1;
                    }
                    utils.each( nodes, function ( i, n ) {
                        if ( n && n.getData( 'bold' ) ) {
                            result = 1;
                            return false;
                        }
                    } );
                    return result;
                }
            } ),
            "italic": kity.createClass( "italicCommand", {
                base: Command,

                execute: function () {

                    var nodes = km.getSelectedNodes();
                    if ( this.queryState( 'italic' ) == 1 ) {
                        utils.each( nodes, function ( i, n ) {
                            n.setData( 'italic' );
                            n.getTextShape().setAttr( 'font-style' );
                            km.updateLayout( n )
                        } )
                    } else {
                        utils.each( nodes, function ( i, n ) {
                            n.setData( 'italic', true );
                            n.getTextShape().setAttr( 'font-style', 'italic' );
                            km.updateLayout( n )
                        } )
                    }
                },
                queryState: function () {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if ( nodes.length == 0 ) {
                        return -1;
                    }
                    utils.each( nodes, function ( i, n ) {
                        if ( n && n.getData( 'italic' ) ) {
                            result = 1;
                            return false;
                        }
                    } );
                    return result;
                }
            } )
        },
        addShortcutKeys: {
            "bold": "ctrl+b", //bold
            "italic": "ctrl+i" //italic
        },
        "events": {
            "afterrendernodecenter": function ( e ) {
                //加粗
                if ( e.node.getData( 'bold' ) ) {
                    e.node.getTextShape().setAttr( 'font-weight', 'bold' );
                }

                if ( e.node.getData( 'italic' ) ) {
                    e.node.getTextShape().setAttr( 'font-style', 'italic' );
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
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
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
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
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
                },
                queryState:function(km){
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                }
            } )
        },

        "events": {
            "afterrendernodecenter": function ( e ) {
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
    var me = this;

    var timeline;

    me.setOptions( 'zoom', [ 50, 80, 100, 120, 150, 200 ] );

    function zoomMinder( minder, zoom ) {
        var paper = minder.getPaper();
        var viewport = paper.getViewPort();

        if ( !zoom ) return;

        var animator = new kity.Animator( {
            beginValue: viewport.zoom,
            finishValue: zoom / 100,
            setter: function ( target, value ) {
                viewport.zoom = value;
                target.setViewPort( viewport );
            }
        } );
        minder.zoom = zoom;
        if ( timeline ) {
            timeline.pause();
        }
        timeline = animator.start( paper, 500, 'ease' );
    }

    var ZoomCommand = kity.createClass( 'Zoom', {
        base: Command,
        execute: zoomMinder,
        queryValue: function ( minder ) {
            return minder.zoom;
        }
    } );

    var ZoomInCommand = kity.createClass( 'ZoomInCommand', {
        base: Command,
        execute: function ( minder ) {
            zoomMinder( minder, this.nextValue( minder ) );
        },
        queryState: function ( minder ) {
            return ~this.nextValue( minder );
        },
        nextValue: function ( minder ) {
            var stack = minder.getOptions( 'zoom' ),
                i;
            for ( i = 0; i < stack.length; i++ ) {
                if ( stack[ i ] > minder.zoom ) return stack[ i ];
            }
            return 0;
        },
        enableReadOnly: false
    } );

    var ZoomOutCommand = kity.createClass( 'ZoomOutCommand', {
        base: Command,
        execute: function ( minder ) {
            zoomMinder( minder, this.nextValue( minder ) );
        },
        queryState: function ( minder ) {
            return ~this.nextValue( minder );
        },
        nextValue: function ( minder ) {
            var stack = minder.getOptions( 'zoom' ),
                i;
            for ( i = stack.length - 1; i >= 0; i-- ) {
                if ( stack[ i ] < minder.zoom ) return stack[ i ];
            }
            return 0;
        },
        enableReadOnly: false
    } );

    return {
        init: function () {
            this.zoom = 100;
        },
        commands: {
            'zoom-in': ZoomInCommand,
            'zoom-out': ZoomOutCommand,
            'zoom': ZoomCommand
        },
        events: {
            'normal.keydown': function ( e ) {
                var me = this;
                var originEvent = e.originEvent;
                var keyCode = originEvent.keyCode || originEvent.which;
                if ( keymap[ '=' ] == keyCode ) {
                    me.execCommand( 'zoom-in' );
                }
                if ( keymap[ '-' ] == keyCode ) {
                    me.execCommand( 'zoom-out' );

                }
            },
            'ready': function () {
                this._zoomValue = 1;
            },
            'normal.mousewheel readonly.mousewheel': function ( e ) {
                if ( !e.originEvent.ctrlKey ) return;
                var delta = e.originEvent.wheelDelta;
                var me = this;

                if ( !kity.Browser.mac ) {
                    delta = -delta;
                }

                // 稀释
                if ( Math.abs( delta ) > 100 ) {
                    clearTimeout( this._wheelZoomTimeout );
                } else {
                    return;
                }

                this._wheelZoomTimeout = setTimeout( function () {
                    var value;
                    var lastValue = me.getPaper()._zoom || 1;
                    if ( delta < 0 ) {
                        me.execCommand( 'zoom-in' );
                    } else if ( delta > 0 ) {
                        me.execCommand( 'zoom-out' );
                    }
                }, 100 );

                e.originEvent.preventDefault();
            }
        }
    };
} );

KityMinder.registerModule( "NodeText", function () {
    return {
        events: {
            'renderNodeCenter': function ( e ) {
                var node = e.node;
                var width = node.getContRc().getWidth();
                var textShape = new kity.Text( node.getData( 'text' ) || '' );
                textShape.setAttr( '_nodeTextShape', true );
                node.getContRc().appendShape( textShape );
                var style = this.getCurrentLayoutStyle()[ node.getType() ];
                textShape.fill( style.color ).setSize( style.fontSize );
                textShape.setTranslate( width + style.spaceLeft, 0 );
                textShape.setVerticalAlign( 'middle' );
            }
        }
    }
} );

KityMinder.registerModule( "hyperlink", function () {
    var linkShapePath = "M16.614,10.224h-1.278c-1.668,0-3.07-1.07-3.599-2.556h4.877c0.707,0,1.278-0.571,1.278-1.278V3.834 c0-0.707-0.571-1.278-1.278-1.278h-4.877C12.266,1.071,13.668,0,15.336,0h1.278c2.116,0,3.834,1.716,3.834,3.834V6.39 C20.448,8.508,18.73,10.224,16.614,10.224z M5.112,5.112c0-0.707,0.573-1.278,1.278-1.278h7.668c0.707,0,1.278,0.571,1.278,1.278 S14.765,6.39,14.058,6.39H6.39C5.685,6.39,5.112,5.819,5.112,5.112z M2.556,3.834V6.39c0,0.707,0.573,1.278,1.278,1.278h4.877 c-0.528,1.486-1.932,2.556-3.599,2.556H3.834C1.716,10.224,0,8.508,0,6.39V3.834C0,1.716,1.716,0,3.834,0h1.278 c1.667,0,3.071,1.071,3.599,2.556H3.834C3.129,2.556,2.556,3.127,2.556,3.834z";
    return {
        "commands": {
            "hyperlink": kity.createClass( "hyperlink", {
                base: Command,

                execute: function ( km, url ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink', url );
                        km.updateLayout( n )
                    } )

                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if ( nodes.length == 0 ) {
                        return -1;
                    }
                    utils.each( nodes, function ( i, n ) {
                        if ( n && n.getData( 'hyperlink' ) ) {
                            result = 0;
                            return false;
                        }
                    } );
                    return result;
                },
                queryValue: function ( km ) {
                    var node = km.getSelectedNode();
                    return node.getData( 'hyperlink' );
                }
            } ),
            "unhyperlink": kity.createClass( "hyperlink", {
                base: Command,

                execute: function ( km ) {
                    var nodes = km.getSelectedNodes();
                    utils.each( nodes, function ( i, n ) {
                        n.setData( 'hyperlink' );
                        km.updateLayout( n )
                    } )
                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes();

                    if ( nodes.length == 0 ) {
                        return -1;
                    }
                    var link = false;
                    utils.each( nodes, function ( i, n ) {
                        if ( n.getData( 'hyperlink' ) ) {
                            link = true;
                            return false;
                        }
                    } );
                    if ( link ) {
                        return 0
                    }
                    return -1;
                }
            } )
        },
        "events": {
            "RenderNodeRight": function ( e ) {
                var node = e.node,
                    url;
                if ( url = node.getData( 'hyperlink' ) ) {
                    var link = new kity.HyperLink( url );
                    var linkshape = new kity.Path();
                    var box = node.getContRc().getBoundaryBox();
                    var style = this.getCurrentLayoutStyle()[ node.getType() ];
                    linkshape.setPathData( linkShapePath ).fill( '#666' ).setTranslate( box.x + box.width + style.spaceLeft, -5 );
                    link.addShape( linkshape );
                    link.setTarget( '_blank' );
                    link.setStyle( 'cursor', 'pointer' );
                    node.getContRc().addShape( link );

                }
            }
        }
    };
} );

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

/*! jQuery UI - v1.10.4 - 2014-02-18
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.draggable.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function(e,t){function i(t,i){var s,a,o,r=t.nodeName.toLowerCase();return"area"===r?(s=t.parentNode,a=s.name,t.href&&a&&"map"===s.nodeName.toLowerCase()?(o=e("img[usemap=#"+a+"]")[0],!!o&&n(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||i:i)&&n(t)}function n(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var s=0,a=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,n){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),n&&n.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var n,s,a=e(this[0]);a.length&&a[0]!==document;){if(n=a.css("position"),("absolute"===n||"relative"===n||"fixed"===n)&&(s=parseInt(a.css("zIndex"),10),!isNaN(s)&&0!==s))return s;a=a.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++s)})},removeUniqueId:function(){return this.each(function(){a.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,n){return!!e.data(t,n[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),s=isNaN(n);return(s||n>=0)&&i(t,!s)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,n){function s(t,i,n,s){return e.each(a,function(){i-=parseFloat(e.css(t,"padding"+this))||0,n&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),s&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var a="Width"===n?["Left","Right"]:["Top","Bottom"],o=n.toLowerCase(),r={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+n]=function(i){return i===t?r["inner"+n].call(this):this.each(function(){e(this).css(o,s(this,i)+"px")})},e.fn["outer"+n]=function(t,i){return"number"!=typeof t?r["outer"+n].call(this,t):this.each(function(){e(this).css(o,s(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,n){var s,a=e.ui[t].prototype;for(s in n)a.plugins[s]=a.plugins[s]||[],a.plugins[s].push([i,n[s]])},call:function(e,t,i){var n,s=e.plugins[t];if(s&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(n=0;s.length>n;n++)e.options[s[n][0]]&&s[n][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var n=i&&"left"===i?"scrollLeft":"scrollTop",s=!1;return t[n]>0?!0:(t[n]=1,s=t[n]>0,t[n]=0,s)}})})(jQuery);(function(t,e){var i=0,s=Array.prototype.slice,n=t.cleanData;t.cleanData=function(e){for(var i,s=0;null!=(i=e[s]);s++)try{t(i).triggerHandler("remove")}catch(o){}n(e)},t.widget=function(i,s,n){var o,a,r,h,l={},c=i.split(".")[0];i=i.split(".")[1],o=c+"-"+i,n||(n=s,s=t.Widget),t.expr[":"][o.toLowerCase()]=function(e){return!!t.data(e,o)},t[c]=t[c]||{},a=t[c][i],r=t[c][i]=function(t,i){return this._createWidget?(arguments.length&&this._createWidget(t,i),e):new r(t,i)},t.extend(r,a,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),h=new s,h.options=t.widget.extend({},h.options),t.each(n,function(i,n){return t.isFunction(n)?(l[i]=function(){var t=function(){return s.prototype[i].apply(this,arguments)},e=function(t){return s.prototype[i].apply(this,t)};return function(){var i,s=this._super,o=this._superApply;return this._super=t,this._superApply=e,i=n.apply(this,arguments),this._super=s,this._superApply=o,i}}(),e):(l[i]=n,e)}),r.prototype=t.widget.extend(h,{widgetEventPrefix:a?h.widgetEventPrefix||i:i},l,{constructor:r,namespace:c,widgetName:i,widgetFullName:o}),a?(t.each(a._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,r,i._proto)}),delete a._childConstructors):s._childConstructors.push(r),t.widget.bridge(i,r)},t.widget.extend=function(i){for(var n,o,a=s.call(arguments,1),r=0,h=a.length;h>r;r++)for(n in a[r])o=a[r][n],a[r].hasOwnProperty(n)&&o!==e&&(i[n]=t.isPlainObject(o)?t.isPlainObject(i[n])?t.widget.extend({},i[n],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,n){var o=n.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,h=s.call(arguments,1),l=this;return a=!r&&h.length?t.widget.extend.apply(null,[a].concat(h)):a,r?this.each(function(){var s,n=t.data(this,o);return n?t.isFunction(n[a])&&"_"!==a.charAt(0)?(s=n[a].apply(n,h),s!==n&&s!==e?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):e):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+a+"'")}):this.each(function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new n(a,this))}),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,s){var n,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},n=i.split("."),i=n.shift(),n.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;n.length-1>a;a++)o[n[a]]=o[n[a]]||{},o=o[n[a]];if(i=n.pop(),1===arguments.length)return o[i]===e?null:o[i];o[i]=s}else{if(1===arguments.length)return this.options[i]===e?null:this.options[i];r[i]=s}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var o,a=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=o=t(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,o=this.widget()),t.each(n,function(n,r){function h(){return i||a.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof r?a[r]:r).apply(a,arguments):e}"string"!=typeof r&&(h.guid=r.guid=r.guid||h.guid||t.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+a.eventNamespace,u=l[2];u?o.delegate(u,c,h):s.bind(c,h)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}})})(jQuery);(function(t){var e=!1;t(document).mouseup(function(){e=!1}),t.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!e){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,a="string"==typeof this.options.cancel&&i.target.nodeName?t(i.target).closest(this.options.cancel).length:!1;return n&&!a&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===t.data(i.target,this.widgetName+".preventClickEvent")&&t.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return s._mouseMove(t)},this._mouseUpDelegate=function(t){return s._mouseUp(t)},t(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),e=!0,!0)):!0}},_mouseMove:function(e){return t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button?this._mouseUp(e):this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){return t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t){t.widget("ui.draggable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"!==this.options.helper||/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},_destroy:function(){this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy()},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(t(i.iframeFix===!0?"iframe":i.iframeFix).each(function(){t("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(t(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offsetParent=this.helper.offsetParent(),this.offsetParentCssPosition=this.offsetParent.css("position"),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},this.offset.scroll=!1,t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_mouseDrag:function(e,i){if("fixed"===this.offsetParentCssPosition&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"original"!==this.options.helper||t.contains(this.element[0].ownerDocument,this.element[0])?("invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1):!1},_mouseUp:function(e){return t("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return s.parents("body").length||s.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s[0]===this.element[0]||/(fixed|absolute)/.test(s.css("position"))||s.css("position","absolute"),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.element.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;return n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):"document"===n.containment?(this.containment=[0,0,t(document).width()-this.helperProportions.width-this.margins.left,(t(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):n.containment.constructor===Array?(this.containment=n.containment,undefined):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e="hidden"!==i.css("overflow"),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=i),undefined):(this.containment=null,undefined)},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent;return this.offset.scroll||(this.offset.scroll={top:n.scrollTop(),left:n.scrollLeft()}),{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top)*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)*s}},_generatePosition:function(e){var i,s,n,a,o=this.options,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=e.pageX,h=e.pageY;return this.offset.scroll||(this.offset.scroll={top:r.scrollTop(),left:r.scrollLeft()}),this.originalPosition&&(this.containment&&(this.relative_container?(s=this.relative_container.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,e.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),e.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),e.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),e.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,l=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s]),"drag"===e&&(this.positionAbs=this._convertPositionTo("absolute")),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i){var s=t(this).data("ui-draggable"),n=s.options,a=t.extend({},i,{item:s.element});s.sortables=[],t(n.connectToSortable).each(function(){var i=t.data(this,"ui-sortable");i&&!i.options.disabled&&(s.sortables.push({instance:i,shouldRevert:i.options.revert}),i.refreshPositions(),i._trigger("activate",e,a))})},stop:function(e,i){var s=t(this).data("ui-draggable"),n=t.extend({},i,{item:s.element});t.each(s.sortables,function(){this.instance.isOver?(this.instance.isOver=0,s.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=this.shouldRevert),this.instance._mouseStop(e),this.instance.options.helper=this.instance.options._helper,"original"===s.options.helper&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",e,n))})},drag:function(e,i){var s=t(this).data("ui-draggable"),n=this;t.each(s.sortables,function(){var a=!1,o=this;this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this.instance._intersectsWith(this.instance.containerCache)&&(a=!0,t.each(s.sortables,function(){return this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this!==o&&this.instance._intersectsWith(this.instance.containerCache)&&t.contains(o.instance.element[0],this.instance.element[0])&&(a=!1),a})),a?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=t(n).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return i.helper[0]},e.target=this.instance.currentItem[0],this.instance._mouseCapture(e,!0),this.instance._mouseStart(e,!0,!0),this.instance.offset.click.top=s.offset.click.top,this.instance.offset.click.left=s.offset.click.left,this.instance.offset.parent.left-=s.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=s.offset.parent.top-this.instance.offset.parent.top,s._trigger("toSortable",e),s.dropped=this.instance.element,s.currentItem=s.element,this.instance.fromOutside=s),this.instance.currentItem&&this.instance._mouseDrag(e)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",e,this.instance._uiHash(this.instance)),this.instance._mouseStop(e,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),s._trigger("fromSortable",e),s.dropped=!1)})}}),t.ui.plugin.add("draggable","cursor",{start:function(){var e=t("body"),i=t(this).data("ui-draggable").options;e.css("cursor")&&(i._cursor=e.css("cursor")),e.css("cursor",i.cursor)},stop:function(){var e=t(this).data("ui-draggable").options;e._cursor&&t("body").css("cursor",e._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("opacity")&&(n._opacity=s.css("opacity")),s.css("opacity",n.opacity)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._opacity&&t(i.helper).css("opacity",s._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(){var e=t(this).data("ui-draggable");e.scrollParent[0]!==document&&"HTML"!==e.scrollParent[0].tagName&&(e.overflowOffset=e.scrollParent.offset())},drag:function(e){var i=t(this).data("ui-draggable"),s=i.options,n=!1;i.scrollParent[0]!==document&&"HTML"!==i.scrollParent[0].tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+i.scrollParent[0].offsetHeight-e.pageY<s.scrollSensitivity?i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop+s.scrollSpeed:e.pageY-i.overflowOffset.top<s.scrollSensitivity&&(i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+i.scrollParent[0].offsetWidth-e.pageX<s.scrollSensitivity?i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft+s.scrollSpeed:e.pageX-i.overflowOffset.left<s.scrollSensitivity&&(i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(e.pageY-t(document).scrollTop()<s.scrollSensitivity?n=t(document).scrollTop(t(document).scrollTop()-s.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<s.scrollSensitivity&&(n=t(document).scrollTop(t(document).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(e.pageX-t(document).scrollLeft()<s.scrollSensitivity?n=t(document).scrollLeft(t(document).scrollLeft()-s.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<s.scrollSensitivity&&(n=t(document).scrollLeft(t(document).scrollLeft()+s.scrollSpeed)))),n!==!1&&t.ui.ddmanager&&!s.dropBehaviour&&t.ui.ddmanager.prepareOffsets(i,e)}}),t.ui.plugin.add("draggable","snap",{start:function(){var e=t(this).data("ui-draggable"),i=e.options;e.snapElements=[],t(i.snap.constructor!==String?i.snap.items||":data(ui-draggable)":i.snap).each(function(){var i=t(this),s=i.offset();this!==e.element[0]&&e.snapElements.push({item:this,width:i.outerWidth(),height:i.outerHeight(),top:s.top,left:s.left})})},drag:function(e,i){var s,n,a,o,r,l,h,c,u,d,p=t(this).data("ui-draggable"),g=p.options,f=g.snapTolerance,m=i.offset.left,_=m+p.helperProportions.width,v=i.offset.top,b=v+p.helperProportions.height;for(u=p.snapElements.length-1;u>=0;u--)r=p.snapElements[u].left,l=r+p.snapElements[u].width,h=p.snapElements[u].top,c=h+p.snapElements[u].height,r-f>_||m>l+f||h-f>b||v>c+f||!t.contains(p.snapElements[u].item.ownerDocument,p.snapElements[u].item)?(p.snapElements[u].snapping&&p.options.snap.release&&p.options.snap.release.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=!1):("inner"!==g.snapMode&&(s=f>=Math.abs(h-b),n=f>=Math.abs(c-v),a=f>=Math.abs(r-_),o=f>=Math.abs(l-m),s&&(i.position.top=p._convertPositionTo("relative",{top:h-p.helperProportions.height,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r-p.helperProportions.width}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l}).left-p.margins.left)),d=s||n||a||o,"outer"!==g.snapMode&&(s=f>=Math.abs(h-v),n=f>=Math.abs(c-b),a=f>=Math.abs(r-m),o=f>=Math.abs(l-_),s&&(i.position.top=p._convertPositionTo("relative",{top:h,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c-p.helperProportions.height,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l-p.helperProportions.width}).left-p.margins.left)),!p.snapElements[u].snapping&&(s||n||a||o||d)&&p.options.snap.snap&&p.options.snap.snap.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=s||n||a||o||d)}}),t.ui.plugin.add("draggable","stack",{start:function(){var e,i=this.data("ui-draggable").options,s=t.makeArray(t(i.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});s.length&&(e=parseInt(t(s[0]).css("zIndex"),10)||0,t(s).each(function(i){t(this).css("zIndex",e+i)}),this.css("zIndex",e+s.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("zIndex")&&(n._zIndex=s.css("zIndex")),s.css("zIndex",n.zIndex)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._zIndex&&t(i.helper).css("zIndex",s._zIndex)}})})(jQuery);

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
                        obj.init && obj.init(utils.clonePlainObject(!options || $.isPlainObject(options) ? $.extend2(options || {}, obj.defaultOpt || {}, true) : options));
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
            if($obj.kmui()){
                $obj.on('wrapclick',function(evt){
                    me.supper.show.call(me,$obj,'','offset',15)
                });
            }else{
                $obj.on('click',function(evt){
                    me.supper.show.call(me,$obj,'','offset',15)
                })
            }

            me.register('click',$obj,function(evt){
               me.hide()
            });
            me.data('$mergeObj',$obj)
        }
    }
});

//dropmenu 类
KM.ui.define( 'dropmenu', {
    tmpl: '<ul class="kmui-dropdown-menu" aria-labelledby="dropdownMenu" >' +
        '<%if(data && data.length){for(var i=0,ci;ci=data[i++];){%>' +
        '<%if(ci.divider){%><li class="kmui-divider"></li><%}else{%>' +
        '<li <%if(ci.active||ci.disabled){%>class="<%= ci.active|| \'\' %> <%=ci.disabled||\'\' %>" <%}%> data-value="<%= ci.value%>" data-label="<%= ci.label%>">' +
        '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= ci.label%></a>' +
        '</li><%}}%>' +
        '<%}%>' +
        '</ul>',
    subTmpl: '<%if(data && data.length){for(var i=0,ci;ci=data[i++];){%>' +
        '<%if(ci.divider){%><li class="kmui-divider"></li><%}else{%>' +
        '<li <%if(ci.active||ci.disabled){%>class="<%= ci.active|| \'\' %> <%=ci.disabled||\'\' %>" <%}%> data-value="<%= ci.value%>" data-label="<%= ci.label%>">' +
        '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= ci.label%></a>' +
        '</li><%}}%>' +
        '<%}%>',
    defaultOpt: {
        data: [],
        anchor: 'top',
        click: function () {}
    },
    setData: function ( items ) {

        this.root().html( $.parseTmpl( this.subTmpl, items ) );

        return this;
    },
    position: function ( offset ) {
        this.root().css( {
            left: offset.x,
            top: offset.y
        } );
        return this;
    },
    show: function () {
        if ( this.trigger( 'beforeshow' ) === false ) {
            return;
        } else {
            this.root().css( {
                display: 'block'
            } );
            this.trigger( 'aftershow' );
        }
        return this;
    },
    init: function ( options ) {
        var me = this;
        var eventName = {
            click: 1,
            mouseover: 1,
            mouseout: 1
        };

        this.root( $( $.parseTmpl( this.tmpl, options ) ) ).on( 'click', 'li[class!="kmui-disabled kmui-divider kmui-dropdown-submenu"]', function ( evt ) {
            $.proxy( options.click, me, evt, $( this ).data( 'value' ), $( this ).data( 'label' ), $( this ) )();
        } ).find( 'li' ).each( function ( i, el ) {
            var $this = $( this );
            if ( !$this.hasClass( "kmui-disabled kmui-divider kmui-dropdown-submenu" ) ) {
                var data = options.data[ i ];
                $.each( eventName, function ( k ) {
                    if ( data[ k ] ) {
                        $this[ k ]( function ( evt ) {
                            $.proxy( data[ k ], el )( evt, data, me.root );
                        } );
                    }
                } );
            }
        } );

    },
    _initEvent: function () {
        this.root().on( 'mouseover', 'li[class="kmui-dropdown-submenu', function ( e ) {
            var $submenu = $( this ).data( 'widget' );
            $submenu.kmui().show( $( this ), 'right', 'position', 5, 2 );
        } );
    },
    disabled: function ( cb ) {
        $( 'li[class!=kmui-divider]', this.root() ).each( function () {
            var $el = $( this );
            if ( cb === true ) {
                $el.addClass( 'kmui-disabled' );
            } else if ( $.isFunction( cb ) ) {
                $el.toggleClass( 'kmui-disabled', cb( $el ) );
            } else {
                $el.removeClass( 'kmui-disabled' );
            }

        } );
    },
    val: function ( val ) {
        var currentVal;
        $( 'li[class!="kmui-divider kmui-disabled kmui-dropdown-submenu"]', this.root() ).each( function () {
            var $el = $( this );
            if ( val === undefined ) {
                if ( $el.find( 'em.kmui-dropmenu-checked' ).length ) {
                    currentVal = $el.data( 'value' );
                    return false;
                }
            } else {
                $el.find( 'em' ).toggleClass( 'kmui-dropmenu-checked', $el.data( 'value' ) == val );
            }
        } );
        if ( val === undefined ) {
            return currentVal;
        }
    },
    appendItem: function ( item ) {
        var itemTpl = '<%if(item.divider){%><li class="kmui-divider"></li><%}else{%>' +
            '<li <%if(item.active||item.disabled){%>class="<%= item.active|| \'\' %> <%=item.disabled||\'\' %>" <%}%> data-value="<%= item.value%>" data-label="<%= item.label%>">' +
            '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= item.label%></a>' +
            '</li><%}%>';
        var html = $.parseTmpl( itemTpl, item );
        var $item = $( html ).click( item.click );
        this.root().append( $item );
    },
    addSubmenu: function ( label, menu, index ) {
        index = index || 0;

        var $list = $( 'li[class!=kmui-divider]', this.root() );
        var $node = $( '<li class="kmui-dropdown-submenu"><a tabindex="-1" href="#">' + label + '</a></li>' ).append( menu );
        $node.data( 'widget', menu );
        if ( index >= 0 && index < $list.length ) {
            $node.insertBefore( $list[ index ] );
        } else if ( index < 0 ) {
            $node.insertBefore( $list[ 0 ] );
        } else if ( index >= $list.length ) {
            $node.appendTo( $list );
        }
    }
}, 'menu' );

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
                "<li class=\"<%=itemClassName%><%if( selected == index ) {%> kmui-combobox-checked<%}%><%if( disabled[ index ] === true ) {%> kmui-combobox-item-disabled<%}%>\" data-item-index=\"<%=index%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ index ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=items[index]%></label>" +
                "</li>" +
                "<%}%>" +
                "<%if( i ) {%>" +
                "<li class=\"kmui-combobox-item-separator\"></li>" +
                "<%}%>" +
                "<%}%>" +
                "<%for( var i=0, label; label = items[i]; i++ ) {%>" +
                "<li class=\"<%=itemClassName%><%if( selected == i && enabledSelected ) {%> kmui-combobox-checked<%}%> kmui-combobox-item-<%=i%><%if( disabled[ i ] === true ) {%> kmui-combobox-item-disabled<%}%>\" data-item-index=\"<%=i%>\" unselectable=\"on\" onmousedown=\"return false\">" +
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
                //初始禁用状态
                disabled: {},
                //自动记录
                autoRecord: true,
                //最多记录条数
                recordCount: 5,
                enabledRecord:true,
                enabledSelected:true
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
                    options = me.data( "options" ),
                    labelClass = "."+labelClassName;

                me.root().delegate('.' + itemClassName, 'click', function(){

                    var $li = $(this),
                        index = $li.attr('data-item-index');

                    if ( options.disabled[ index ] ) {
                        return false;
                    }

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


                var options = this.data( 'options' ),
                    itemCount = options.itemCount,
                    items = options.autowidthitem;

                if ( items && !items.length ) {
                    items = options.items;
                }

                // 禁用
                if ( options.disabled[ index ] ) {
                    return null;
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
            getItems: function () {
                return this.data( "options" ).items;
            },
            traverseItems:function(fn){
                var values = this.data('options').value;
                var labels = this.data('options').items;
                $.each(labels,function(i,label){
                    fn(label,values[i])
                });
                return this;
            },
            getItemMapping: function () {
                return this.data( "options" ).itemMapping;
            },

            disableItemByIndex: function ( index ) {

                var options = this.data( "options" );
                options.disabled[ index ] = true;

                this._repaint();

            },

            disableItemByLabel: function ( label ) {

                var itemMapping = this.data('options').itemMapping,
                    index = itemMapping[ label ];

                if ( typeof index === "number" ) {
                    return this.disableItemByIndex( index );
                }

                return false;

            },

            enableItemByIndex: function ( index ) {

                var options = this.data( "options" );
                delete options.disabled[ index ];

                this._repaint();

            },

            enableItemByLabel: function ( label ) {

                var itemMapping = this.data('options').itemMapping,
                    index = itemMapping[ label ];

                if ( typeof index === "number" ) {
                    return this.enableItemByIndex( index );
                }

                return false;

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
                    newStack = [];

                if(this.data('options').enabledRecord){
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
                }

                options.selected = index;

                this._repaint();

                newStack = null;

            },

            _repaint: function () {

                var newChilds = $( $.parseTmpl( this.tpl, this.data("options") ) );

                //重新渲染
                this.root().html( newChilds.html() );

                newChilds = null;

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
KM.ui.define( 'modal', {
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
    init: function ( options ) {
        var me = this;

        me.root( $( $.parseTmpl( me.tpl, options || {} ) ) );

        me.data( "options", options );
        if ( options.okFn ) {
            me.on( 'ok', $.proxy( options.okFn, me ) )
        }
        if ( options.cancelFn ) {
            me.on( 'beforehide', $.proxy( options.cancelFn, me ) )
        }

        me.root().delegate( '[data-hide="modal"]', 'click', $.proxy( me.hide, me ) )
            .delegate( '[data-ok="modal"]', 'click', $.proxy( me.ok, me ) );

        $( '[data-hide="modal"],[data-ok="modal"]', me.root() ).hover( function () {
            $( this ).toggleClass( 'kmui-hover' )
        } );

        setTimeout( function () {
            $( '.kmui-modal' ).draggable( {
                handle: '.kmui-modal-header'
            } );
        }, 100 );
    },
    toggle: function () {
        var me = this;
        return me[ !me.data( "isShown" ) ? 'show' : 'hide' ]();
    },
    show: function () {
        var me = this;

        me.trigger( "beforeshow" );

        if ( me.data( "isShown" ) ) return;

        me.data( "isShown", true );

        me.escape();

        me.backdrop( function () {
            me.autoCenter();
            me.root()
                .show()
                .focus()
                .trigger( 'aftershow' );
        } );

        $( '.kmui-modal' ).draggable( {
            handle: '.kmui-modal-header'
        } );
    },
    showTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).html( text ).fadeIn();
    },
    hideTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).fadeOut( function () {
            $( this ).html( '' );
        } );
    },
    autoCenter: function () {
        //ie6下不用处理了
        !$.IE6 && this.root().css( "margin-left", -( this.root().width() / 2 ) );
    },
    hide: function () {
        var me = this;

        me.trigger( "beforehide" );

        if ( !me.data( "isShown" ) ) return;

        me.data( "isShown", false );

        me.escape();

        me.hideModal();
    },
    escape: function () {
        var me = this;
        if ( me.data( "isShown" ) && me.data( "options" ).keyboard ) {
            me.root().on( 'keyup', function ( e ) {
                e.which == 27 && me.hide();
            } )
        } else if ( !me.data( "isShown" ) ) {
            me.root().off( 'keyup' );
        }
    },
    hideModal: function () {
        var me = this;
        me.root().hide();
        me.backdrop( function () {
            me.removeBackdrop();
            me.trigger( 'afterhide' );
        } )
    },
    removeBackdrop: function () {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    },
    backdrop: function ( callback ) {
        var me = this;
        if ( me.data( "isShown" ) && me.data( "options" ).backdrop ) {
            me.$backdrop = $( '<div class="kmui-modal-backdrop" />' ).click(
                me.data( "options" ).backdrop == 'static' ?
                $.proxy( me.root()[ 0 ].focus, me.root()[ 0 ] ) : $.proxy( me.hide, me )
            )
        }
        me.trigger( 'afterbackdrop' );
        callback && callback();

    },
    attachTo: function ( $obj ) {
        var me = this
        if ( !$obj.data( '$mergeObj' ) ) {

            $obj.data( '$mergeObj', me.root() );
            $obj.on( 'wrapclick', function () {
                me.toggle( $obj )
            } );
            me.data( '$mergeObj', $obj )
        }
    },
    ok: function () {
        var me = this;
        me.trigger( 'beforeok' );
        if ( me.trigger( "ok", me ) === false ) {
            return;
        }
        me.hide();
    },
    getBodyContainer: function () {
        return this.root().find( '.kmui-modal-body' )
    }
} );

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
        _kityminderToolbarUI = {},
        _activeWidget = null,
        _widgetData = {},
        _widgetCallBack = {};
    return {
        registerUI: function ( uiname, fn ) {
            utils.each( uiname.split( /\s+/ ), function ( i, name ) {
                _kityminderUI[ name ] = fn;
            } )
        },
        registerToolbarUI: function ( uiname, fn ) {
            utils.each( uiname.split( /\s+/ ), function ( i, name ) {
                _kityminderToolbarUI[ name ] = fn;
            } )
        },
        loadUI: function ( km ) {
            utils.each( _kityminderUI, function ( i, fn ) {
                fn.call( km )
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
                            if ( _kityminderToolbarUI[ name ] ) {
                                var ui = _kityminderToolbarUI[ name ].call( km, name );
                                ui && btns.push( ui );
                            }

                        }

                    } );
                    btns.length && $toolbar.kmui().appendToBtnmenu( btns );
                } );
                $toolbar.append( $( '<div class="kmui-dialog-container"></div>' ) );
            }else{
                $toolbar.hide()
            }

        },
        _createStatusbar: function ( $statusbar, km ) {

        },
        getKityMinder: function ( id, options ) {
            var containers = this._createUI( id );
            var km = this.getMinder( containers.$body.get( 0 ), options );
            this._createToolbar( containers.$toolbar, km );
            this._createStatusbar( containers.$statusbar, km );
            km.$container = containers.$container;

            this.loadUI( km );
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

            //清除光标
            km.fire('selectionclear');
            pro.initContent( km, $widget );
            //在dialog上阻止键盘冒泡，导致跟编辑输入冲突的问题
            $widget.on('keydown keyup keypress',function(e){
                e.stopPropagation()
            });
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

KM.registerToolbarUI( 'bold italic redo undo unhyperlink expandnode collapsenode hand zoom-in zoom-out',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: function () {
                me.execCommand( name );
            },
            title: this.getLang( 'tooltips' )[ name ] || ''
        } );
        this.on( 'interactchange', function () {
            var state = this.queryCommandState( name );
            $btn.kmui().disabled( state == -1 ).active( state == 1 );
        } );
        return $btn;
    }
);

KM.registerToolbarUI( 'fontfamily fontsize', function ( name ) {

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
            options.itemStyles.push( 'font-size: ' + temp + 'px; height:' + (temp+2) + 'px; line-height: ' + (temp + 2) + 'px' );
        }

        options.value = options.items;
        options.items = tempItems;
        options.autoRecord = false;

        return options;

    }

} );


KM.registerToolbarUI( 'forecolor', function ( name ) {
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
            if( color != '#000000'){
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

KM.registerToolbarUI( 'saveto', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: [],
            itemStyles: [],
            value: [],
            autowidthitem: [],
            enabledRecord: false,
            enabledSelected: false
        },
        $combox = null,
        comboboxWidget = null;

    utils.each( KityMinder.getAllRegisteredProtocals(), function ( k ) {
        var p = KityMinder.findProtocal( k );
        if ( p.encode ) {
            var text = p.fileDescription + '（' + p.fileExtension + '）';
            options.value.push( k );
            options.items.push( text );
            options.autowidthitem.push( $.wordCountAdaptive( text ), true );
        }
    } );


    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    function doDownload( url, filename ) {
        var a = document.createElement( 'a' );
        a.setAttribute( 'download', filename );
        a.setAttribute( 'href', url );
        var evt;
        try {
            evt = new MouseEvent( 'click' );
        } catch ( error ) {
            evt = document.createEvent( 'MouseEvents' );
            evt.initEvent( 'click', true, true );
        }
        a.dispatchEvent( evt );
    }

    var ie_ver = function () {
        var iev = 0;
        var ieold = ( /MSIE (\d+\.\d+);/.test( navigator.userAgent ) );
        var trident = !! navigator.userAgent.match( /Trident\/7.0/ );
        var rv = navigator.userAgent.indexOf( "rv:11.0" );
        if ( ieold ) iev = new Number( RegExp.$1 );
        if ( navigator.appVersion.indexOf( "MSIE 10" ) != -1 ) iev = 10;
        if ( trident && rv != -1 ) iev = 11;
        return iev;
    };
    var doSave = function ( urltype, d, filename ) {
        var iframe = document.createElement( 'iframe' );
        iframe.style.display = 'none';
        document.body.appendChild( iframe );
        iframe.contentDocument.open( urltype, 'replace' );
        iframe.contentDocument.writeln( d );
        iframe.contentDocument.execCommand( 'saveas', '', filename );
    };
    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        var data = me.exportData( res.value );
        var p = KityMinder.findProtocal( res.value );
        var filename = me.getMinderTitle() + p.fileExtension;
        if ( typeof ( data ) == 'string' ) {
            var url = 'data:text/plain; utf-8,' + encodeURIComponent( data );
            if ( ie_ver() > 0 ) {
                //console.log( p.fileExtension );
                if ( p.fileExtension === '.km' ) {
                    doSave( 'application/x-javascript', data, me.getMinderTitle() );
                } else if ( p.fileExtension === '.svg' ) {
                    //doSave( 'image/svg+xml', data, filename );
                } else {
                    doSave( 'text/html', data, filename );
                }
            } else {
                doDownload( url, filename );
            }
        } else if ( data && data.then ) {
            data.then( function ( url ) {
                if ( ie_ver() > 0 ) {
                    //doSave( 'application/base64', url.replace( 'image/octet-stream,', '' ), filename );
                } else {
                    doDownload( url, filename );
                }
            } );
        }
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } ).on( 'aftercomboboxselect', function () {
        this.setLabelWithDefaultValue();
    } );



    return comboboxWidget.button().addClass( 'kmui-combobox' );

} );

KM.registerUI( 'tooltips',
    function ( name ) {
        var km = this;
        //添加tooltip;
        if($.kmuitooltip){

            $("[data-original-title]",km.$container).each(function(i,n){
                var tooltips = km.getLang('tooltips');
                var tooltip = $(n).data('original-title');
                utils.each(tooltips,function(v,k){

                    if(k == tooltip && km.getShortcutKey(v)){
                        $(n).attr('data-original-title',tooltip + ' (' + km.getShortcutKey(v).toUpperCase() + ')');

                    }
                })
            });
            $.kmuitooltip('attachTo', $("[data-original-title]",km.$container)).css('z-index',km.getOptions('zIndex')+1);
        }
        km.$container.find('a').click(function(evt){
            evt.preventDefault()
        });
    }
);

KM.registerToolbarUI( 'switchlayout', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getLayoutStyleItems() || [],
            itemStyles: [],
            value: me.getLayoutStyleItems(),
            autowidthitem: [],
            enabledRecord: false
        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    utils.each( options.items, function ( i, item ) {
        options.items[ i ] = me.getLang( 'layout' )[ item ];
    } );
    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand( name, res.value );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }

    } );
    //状态反射
    me.on( 'interactchange', function () {
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

    var data = [];
    utils.each( me.getLayoutStyleItems(), function ( i, v ) {
        data.push( {
            label: me.getLang( 'tooltips.' + name ) + ' ' + v,
            cmdName: 'switchlayout',
            exec: function () {
                me.execCommand( 'switchlayout', v );
            }
        } )
    } );
    data.push( {
        divider: 1
    } );
    me.addContextmenu( data );
    return comboboxWidget.button().addClass( 'kmui-combobox' );
} );

KM.registerToolbarUI( 'node', function ( name ) {
    var shortcutKeys = {
        "appendsiblingnode": "enter",
        "appendchildnode": "tab",
        "removenode": "del|backspace",
        "editnode": "F2"
    };

    var me = this,
        msg = me.getLang( 'node' ),
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions( name ) || [],
            itemStyles: [],
            value: [],
            autowidthitem: [],
            enabledRecord: false,
            enabledSelected: false
        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( transForInserttopic( options ) ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand( res.value, new MinderNode( me.getLang().topic ), true );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
        var combox = $combox.kmui();

        combox.traverseItems( function ( label, value ) {
            if ( me.queryCommandState( value ) == -1 ) {
                combox.disableItemByLabel( label )
            } else {
                combox.enableItemByLabel( label )
            }
        } )
    } );
    //状态反射
    me.on( 'interactchange', function () {
        var state = 0;
        utils.each( shortcutKeys, function ( k ) {
            state = me.queryCommandState( k );
            if ( state != -1 ) {
                return false;
            }
        } );
        //设置按钮状态
        comboboxWidget.button().kmui().disabled( state == -1 ).active( state == 1 );

    } );
    //comboboxWidget.button().kmui().disabled(-1);
    return comboboxWidget.button().addClass( 'kmui-combobox' );



    function transForInserttopic( options ) {

        var tempItems = [];

        utils.each( options.items, function ( k, v ) {
            options.value.push( v );

            tempItems.push( ( msg[ k ] || k ) + '(' + shortcutKeys[ v ].toUpperCase() + ')' );
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ tempItems.length - 1 ] ) );
        } );

        options.items = tempItems;
        return options;

    }

} );

KM.registerUI( 'contextmenu', function () {
    var me = this;

    function getItemByLabel(label){
        var result;
        utils.each(me.getContextmenu(),function(i,item){
            if(item.label == label){
                result = item;
                return false;
            }
        });
        return result;
    }
    var $menu = $.kmuidropmenu({
        click:function(e,v,l){

            var item = getItemByLabel(l);

            if(item.exec){

                item.exec.apply(km)
            }else{
                me.execCommand(item.cmdName);
            }

            this.hide();
        }
    });
    me.$container.append($menu);
    me.on('contextmenu',function(e){
        var node = e.getTargetNode();
        if(node){
            this.removeAllSelectedNodes();
            this.select(node)
        }


        var items = me.getContextmenu();
        var data = [];

        utils.each(items,function(i,item){
            if(item.divider){
                data.length &&  data.push(item);
                return;
            }
            if(me.queryCommandState(item.cmdName)!=-1){
                data.push({
                    label:item.label,
                    value:item.cmdName
                })
            }
        });
        if(data.length){
            var item = data[data.length-1];
            if(item.divider){
                data.pop();
            }
            $menu.kmui().setData({
                data:data
            }).position(e.getPosition()).show();
        }
        e.preventDefault()

    });
    me.on('click',function(){
        $menu.kmui().hide();
    });
    me.on('beforemousedown',function(e){
        if(e.isRightMB()){
            e.stopPropagationImmediately();
        }
    })
} );



KM.registerToolbarUI( 'markers help preference', function ( name ) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang( 'tooltips' )[ name ] || '',
            url: me.getOptions( 'KITYMINDER_HOME_URL' ) + 'dialogs/' + name + '/' + name + '.js',
        };

    var $btn = $.kmuibutton( {
        icon: name,
        title: this.getLang( 'tooltips' )[ name ] || ''
    } );
    //加载模版数据
    utils.loadFile( document, {
        src: opt.url,
        tag: "script",
        type: "text/javascript",
        defer: "defer"
    }, function () {

        $dialog = $.kmuimodal( opt );

        $dialog.attr( 'id', 'kmui-dialog-' + name ).addClass( 'kmui-dialog-' + name )
            .find( '.kmui-modal-body' ).addClass( 'kmui-dialog-' + name + '-body' );

        $dialog.kmui().on( 'beforeshow', function () {
            var $root = this.root(),
                win = null,
                offset = null;
            if ( !$root.parent()[ 0 ] ) {
                me.$container.find( '.kmui-dialog-container' ).append( $root );
            }
            KM.setWidgetBody( name, $dialog, me );
        } ).attachTo( $btn )
    } );



    me.on( 'interactchange', function () {
        var state = this.queryCommandState( name );
        $btn.kmui().disabled( state == -1 ).active( state == 1 )
    } );
    return $btn;
} );

KM.registerToolbarUI( 'hyperlink', function ( name ) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang( 'tooltips' )[ name ] || '',
            url: me.getOptions( 'KITYMINDER_HOME_URL' ) + 'dialogs/' + name + '/' + name + '.js'

        };

    var $btn = $.kmuibutton( {
        icon: name,
        title: this.getLang( 'tooltips' )[ name ] || ''
    } );
    //加载模版数据
    utils.loadFile( document, {
        src: opt.url,
        tag: "script",
        type: "text/javascript",
        defer: "defer"
    }, function () {

        $dialog = $.kmuimodal( opt );

        $dialog.attr( 'id', 'kmui-dialog-' + name ).addClass( 'kmui-dialog-' + name )
            .find( '.kmui-modal-body' ).addClass( 'kmui-dialog-' + name + '-body' );

        $dialog.kmui().on( 'beforeshow', function () {
            var $root = this.root(),
                win = null,
                offset = null;
            if ( !$root.parent()[ 0 ] ) {
                me.$container.find( '.kmui-dialog-container' ).append( $root );
            }
            KM.setWidgetBody( name, $dialog, me );
        } ).attachTo( $btn );


    } );

    me.addContextmenu( [ {
            label: me.getLang( 'hyperlink.hyperlink' ),
            exec: function (url) {
                $dialog.kmui().show();
            },
            cmdName: 'hyperlink'
        },{
            label: me.getLang( 'hyperlink.unhyperlink' ),
            exec: function () {
                this.execCommand( 'unhyperlink' )
            },
            cmdName: 'unhyperlink'
        }
    ]);

    me.on( 'interactchange', function () {
        var state = this.queryCommandState( name );
        $btn.kmui().disabled( state == -1 ).active( state == 1 )
    } );
    return $btn;
} );

KM.registerToolbarUI( 'zoom', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions( name ) || [],
            itemStyles: [],
            value: me.getOptions( name ),
            autowidthitem: [],
            enabledRecord: false

        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( transForInserttopic( options ) ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand('zoom', res.value );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } );
    //状态反射
    me.on( 'interactchange', function () {

        var state = this.queryCommandState( name ),
            value = this.queryCommandValue( name );
        //设置按钮状态
        comboboxWidget.button().kmui().disabled( state == -1 ).active( state == 1 );
        if ( value ) {
            //设置label
            comboboxWidget.selectItemByLabel( value + '%' );
        }

    } );
    //comboboxWidget.button().kmui().disabled(-1);
    return comboboxWidget.button().addClass( 'kmui-combobox' );



    function transForInserttopic( options ) {

        var tempItems = [];

        utils.each( options.items, function ( k, v ) {
            options.value.push( v );
            tempItems.push( v + '%' );
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ tempItems.length - 1 ] ) );
        } );

        options.items = tempItems;
        return options;

    }

} );

/*

    http://www.xmind.net/developer/

    Parsing XMind file

    XMind files are generated in XMind Workbook (.xmind) format, an open format that is based on the principles of OpenDocument. It consists of a ZIP compressed archive containing separate XML documents for content and styles, a .jpg image file for thumbnails, and directories for related attachments.
 */

KityMinder.registerProtocal( 'xmind', function () {

    // 标签 map
    var markerMap = {
         'priority-1'   : ['PriorityIcon', 1]
        ,'priority-2'   : ['PriorityIcon', 2]
        ,'priority-3'   : ['PriorityIcon', 3]
        ,'priority-4'   : ['PriorityIcon', 4]
        ,'priority-5'   : ['PriorityIcon', 5]

        ,'task-start'   : ['ProgressIcon', 1]
        ,'task-quarter' : ['ProgressIcon', 2]
        ,'task-half'    : ['ProgressIcon', 3]
        ,'task-3quar'   : ['ProgressIcon', 4]
        ,'task-done'    : ['ProgressIcon', 5]

        ,'task-oct'     : null
        ,'task-3oct'    : null
        ,'task-5oct'    : null
        ,'task-7oct'    : null
    };

    function processTopic(topic, obj){

        //处理文本
        obj.data =  { text : topic.title };

        // 处理标签
        if(topic.marker_refs && topic.marker_refs.marker_ref){
            var markers = topic.marker_refs.marker_ref;
            if( markers.length && markers.length > 0 ){
                for (var i in markers) {
                    var type = markerMap[ markers[i]['marker_id'] ];
                    type && (obj.data[ type[0] ] = type[1]);
                }
            }else{
                var type = markerMap[ markers['marker_id'] ];
                type && (obj.data[ type[0] ] = type[1]);
            }
        }

        // 处理超链接
        if(topic['xlink:href']){
            obj.data.hyperlink = topic['xlink:href'];
        }

        //处理子节点
        if( topic.children && topic.children.topics && topic.children.topics.topic ){
            var tmp = topic.children.topics.topic;
            if( tmp.length && tmp.length > 0 ){ //多个子节点
                obj.children = [];

                for(var i in tmp){
                    obj.children.push({});
                    processTopic(tmp[i], obj.children[i]);
                }

            }else{ //一个子节点
                obj.children = [{}];
                processTopic(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xml){
        var json = $.xml2json(xml);
        var result = {};
        var sheet = json.sheet;
        var topic = utils.isArray(sheet) ? sheet[0].topic : sheet.topic;
        processTopic(topic, result);
        return result;
    }

    function getEntries(file, onend) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
            zipReader.getEntries(onend);
        }, onerror);
    }

    return {
        fileDescription: 'xmind格式文件',
        fileExtension: '.xmind',
        
        decode: function ( local ) {

            return {
                then : function(local, callback){

                    getEntries( local, function( entries ) {
                        entries.forEach(function( entry ) {
                            if(entry.filename == 'content.xml'){
                                entry.getData(new zip.TextWriter(), function(text) {
                                    var km = xml2km($.parseXML(text));
                                    callback && callback( km );
                                });
                            }
                        });
                    });
                }
            };

        },
        // recognize: recognize,
        recognizePriority: -1
    };
    
} );




/*

    http://freemind.sourceforge.net/

    freemind文件后缀为.mm，实际格式为xml

*/

KityMinder.registerProtocal( 'freemind', function () {

    // 标签 map
    var markerMap = {
         'full-1'   : ['PriorityIcon', 1]
        ,'full-2'   : ['PriorityIcon', 2]
        ,'full-3'   : ['PriorityIcon', 3]
        ,'full-4'   : ['PriorityIcon', 4]
        ,'full-5'   : ['PriorityIcon', 5]
        ,'full-6'   : null
        ,'full-7'   : null
        ,'full-8'   : null
        ,'full-9'   : null
        ,'full-0'   : null
    };

    function processTopic(topic, obj){

        //处理文本
        obj.data =  { text : topic.TEXT };

        // 处理标签
        if(topic.icon){
            var icons = topic.icon;
            if(icons.length && icons.length > 0){
                for (var i in icons) {
                    var type = markerMap[ icons[i]['BUILTIN'] ];
                    type && (obj.data[ type[0] ] = type[1]);
                }
            }else{
                var type = markerMap[ icons['BUILTIN'] ];
                type && (obj.data[ type[0] ] = type[1]);
            }
        }
        
        // 处理超链接
        if(topic.LINK){
            obj.data.hyperlink = topic.LINK;
        }

        //处理子节点
        if( topic.node ){

            var tmp = topic.node;
            if( tmp.length && tmp.length > 0 ){ //多个子节点
                obj.children = [];

                for(var i in tmp){
                    obj.children.push({});
                    processTopic(tmp[i], obj.children[i]);
                }

            }else{ //一个子节点
                obj.children = [{}];
                processTopic(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xml){
        var json = $.xml2json(xml);
        var result = {};
        processTopic(json.node, result);
        return result;
    }

    return {
        fileDescription: 'xmind格式文件',
        fileExtension: '.xmind',

        decode: function ( local ) {
            var json = xml2km( local );

            return json;
        },
        // recognize: recognize,
        recognizePriority: -1
    };
    
} );




/*

    http://www.mindjet.com/mindmanager/

    mindmanager的后缀为.mmap，实际文件格式是zip，解压之后核心文件是Document.xml

*/

KityMinder.registerProtocal( 'mindmanager', function () {

    // 标签 map
    var markerMap = {
        'urn:mindjet:Prio1': [ 'PriorityIcon', 1 ],
        'urn:mindjet:Prio2': [ 'PriorityIcon', 2 ],
        'urn:mindjet:Prio3': [ 'PriorityIcon', 3 ],
        'urn:mindjet:Prio4': [ 'PriorityIcon', 4 ],
        'urn:mindjet:Prio5': [ 'PriorityIcon', 5 ],
        '0': [ 'ProgressIcon', 1 ],
        '25': [ 'ProgressIcon', 2 ],
        '50': [ 'ProgressIcon', 3 ],
        '75': [ 'ProgressIcon', 4 ],
        '100': [ 'ProgressIcon', 5 ]
    };

    function processTopic( topic, obj ) {
        //处理文本
        obj.data = {
            text: topic.Text && topic.Text.PlainText || ''
        }; // 节点默认的文本，没有Text属性

        // 处理标签
        if ( topic.Task ) {

            var type;
            if ( topic.Task.TaskPriority ) {
                type = markerMap[ topic.Task.TaskPriority ];
                type && ( obj.data[ type[ 0 ] ] = type[ 1 ] );
            }

            if ( topic.Task.TaskPercentage ) {
                type = markerMap[ topic.Task.TaskPercentage ];
                type && ( obj.data[ type[ 0 ] ] = type[ 1 ] );
            }
        }

        // 处理超链接
        if ( topic.Hyperlink ) {
            obj.data.hyperlink = topic.Hyperlink.Url;
        }

        //处理子节点
        if ( topic.SubTopics && topic.SubTopics.Topic ) {

            var tmp = topic.SubTopics.Topic;
            if ( tmp.length && tmp.length > 0 ) { //多个子节点
                obj.children = [];

                for ( var i in tmp ) {
                    obj.children.push( {} );
                    processTopic( tmp[ i ], obj.children[ i ] );
                }

            } else { //一个子节点
                obj.children = [ {} ];
                processTopic( tmp, obj.children[ 0 ] );
            }
        }
    }

    function xml2km( xml ) {
        var json = $.xml2json( xml );
        var result = {};
        processTopic( json.OneTopic.Topic, result );
        return result;
    }

    function getEntries( file, onend ) {
        zip.createReader( new zip.BlobReader( file ), function ( zipReader ) {
            zipReader.getEntries( onend );
        }, onerror );
    }

    return {
        fileDescription: 'mindmanager格式文件',
        fileExtension: '.mmap',

        decode: function ( local ) {

            return {
                then: function ( local, callback ) {

                    getEntries( local, function ( entries ) {
                        entries.forEach( function ( entry ) {
                            if ( entry.filename == 'Document.xml' ) {
                                entry.getData( new zip.TextWriter(), function ( text ) {
                                    var km = xml2km( $.parseXML( text ) );
                                    callback && callback( km );
                                } );
                            }
                        } );
                    } );
                }
            };

        },
        // recognize: recognize,
        recognizePriority: -1
    };

} );

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

KityMinder.registerProtocal( "png", function () {
	function loadImage( url, callback ) {
		var image = new Image();
		image.onload = callback;
		console.log( url );
		image.src = url;
	}

	return {
		fileDescription: 'PNG 图片（暂不支持IE）',
		fileExtension: '.png',
		encode: function ( json, km ) {
			var domContainer = km.getPaper().container,
				svgXml,
				$svg,

				bgDeclare = getComputedStyle( domContainer ).backgroundImage,
				bgUrl = /url\((.+)\)$/.exec( bgDeclare )[ 1 ],

				renderContainer = km.getRenderContainer(),
				renderBox = renderContainer.getRenderBox(),
				transform = renderContainer.getTransform(),
				width = renderBox.width,
				height = renderBox.height,
				padding = 20,

				canvas = document.createElement( 'canvas' ),
				ctx = canvas.getContext( '2d' ),
				blob, DomURL, url, img, finishCallback;

			bgUrl = bgUrl.replace( /"/g, '' );
			renderContainer.translate( -renderBox.x, -renderBox.y );

			svgXml = km.getPaper().container.innerHTML;

			renderContainer.translate( renderBox.x, renderBox.y );

			$svg = $( svgXml );
			$svg.attr( {
				width: renderBox.width,
				height: renderBox.height,
				style: 'font-family: Arial, "Microsoft Yahei","Heiti SC";'
			} );

			// need a xml with width and height
			svgXml = $( '<div></div>' ).append( $svg ).html();

			// svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
			svgXml = svgXml.replace( /&nbsp;/g, '&#xa0;' );

			blob = new Blob( [ svgXml ], {
				type: "image/svg+xml;charset=utf-8"
			} );

			DomURL = window.URL || window.webkitURL || window;

			url = DomURL.createObjectURL( blob );

			canvas.width = width + padding * 2;
			canvas.height = height + padding * 2;

			function fillBackground( ctx, image, width, height ) {
				ctx.save();
				ctx.fillStyle = ctx.createPattern( image, "repeat" );
				ctx.fillRect( 0, 0, width, height );
				ctx.restore();
			}

			function drawImage( ctx, image, x, y ) {
				ctx.drawImage( image, x, y );
			}

			function generateDataUrl( canvas ) {
				var url = canvas.toDataURL( 'png' );
				return url.replace( 'image/png', 'image/octet-stream' );
			}
			loadImage( url, function () {
				var svgImage = this;
				loadImage( bgUrl, function () {
					var downloadUrl;
					fillBackground( ctx, this, canvas.width, canvas.height );
					drawImage( ctx, svgImage, padding, padding );
					DomURL.revokeObjectURL( url );
					downloadUrl = generateDataUrl( canvas );
					if ( finishCallback ) {
						finishCallback( downloadUrl );
					}
				} );
			} );

			return {
				then: function ( callback ) {
					finishCallback = callback;
				}
			};
		},
		recognizePriority: -1
	};
} );

KityMinder.registerProtocal( "svg", function () {
	return {
		fileDescription: 'SVG 矢量图（暂不支持IE）',
		fileExtension: '.svg',
		encode: function ( json, km ) {
			// svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
			return km.getPaper().container.innerHTML.replace( /&nbsp;/g, '&#xa0;' );
		},
		recognizePriority: -1
	};
} );


})(kity, window)