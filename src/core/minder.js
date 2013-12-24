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
        this._options = options;
        options = Utils.extend( window.KITYMINDER_CONFIG || {}, MinderDefaultOptions, options || {} );
        this._initEvents();
        this._initMinder( options );
        this._initModules( options );
    },

    _initMinder: function ( option ) {

        this._rc = new kity.Group();
        this._paper = new kity.Paper();
        this._paper.addShape( this._rc );

        this._root = new MinderNode( this );
        this._rc.addShape( this._root.getRenderContainer() );

        if ( option.renderTo ) {
            this.renderTo( option.renderTo );
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
    }
} );

/**
 * @include <minder.data.js>
 * @include <minder.event.js>
 * @include <minder.module.js>
 * @include <minder.node.js>
 * @include <minder.select.js>
 */