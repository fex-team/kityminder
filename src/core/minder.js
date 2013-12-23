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

var MinderDefaultOptions = {};

var Minder = KityMinder.Minder = kity.createClass( "KityMinder", {
    constructor: function ( options ) {
        options = Utils.extend( KITYMINDER_CONFIG || {}, MinderDefaultOptions, options || {} );
        // 初始化
        this._initMinder( options );
        this._initEvents();
        this._initModules( options );
    },

    _initMinder: function ( option ) {

        this._rc = new kity.Group();
        this._paper = new kity.Paper();
        this._paper.addShape( this._rc );

        this._root = new MinderNode( this );
        this._rc.addShape( this._root.getRenderContainer() );

        if ( option.renderTo ) {
            this.renderTo( this._renderTarget = option.renderTo );
        }
    },

    renderTo: function ( target ) {
        this._paper.renderTo( target );
        this._initEvents();
    },

    getRenderContainer: function () {
        return this._rc;
    },

    getPaper: function () {
        return this._paper;
    }
} );

/**
 * @include <minder.data.js>
 * @include <minder.event.js>
 * @include <minder.module.js>
 * @include <minder.node.js>
 * @include <minder.select.js>
 */