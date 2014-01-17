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
        this._options = Utils.extend( window.KITYMINDER_CONFIG || {}, MinderDefaultOptions, options );
        this._layoutStyles = {};
        this._initEvents();
        this._initMinder();
        this._initSelection();
        this._initModules();
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
    addLayoutStyle: function ( name, style ) {
        this._layoutStyles[ name ] = style;
    },
    getLayoutStyle: function ( name ) {
        return this._layoutStyles[ name ];
    },
    getRenderTarget: function () {
        return this._renderTarget;
    }
} );

/**
 * @include <minder.data.js>
 * @include <minder.event.js>
 * @include <minder.module.js>
 * @include <minder.node.js>
 * @include <minder.select.js>
 */