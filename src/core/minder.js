/**
 * @require <kityminder.js>
 * @require <module.js>
 * @require <event.js>
 * @require <node.js>
 * @reuqire <command.js>
 * @require <utils.js>
 *
 * @description KityMinder 使用类
 */

var MinderDefaultOptions = {
    "layoutstyle": "default"
};

var Minder = KityMinder.Minder = kity.createClass( "KityMinder", {
    constructor: function ( options ) {
        this._options = Utils.extend( window.KITYMINDER_CONFIG || {}, MinderDefaultOptions, options );
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
        Utils.extend( this._options, obj, true );
    },
    _initMinder: function () {

        this._rc = new kity.Group();
        this._paper = new kity.Paper();
        this._paper.addShape( this._rc );
        this._paper.getNode().setAttribute( 'contenteditable', true );
        this._root = new MinderNode();
        this._rc.addShape( this._root.getRenderContainer() );
        if ( this._options.renderTo ) {
            this.renderTo( this._options.renderTo );
        }
    },
    renderTo: function ( target ) {
        this._paper.renderTo( this._renderTarget = target );
        this._bindEvents();
        KityMinder.addMinderInstance( target, this );
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