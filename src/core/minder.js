var Minder = KityMinder.Minder = kity.createClass( "KityMinder", {
    constructor: function ( id, option ) {
        // 初始化
        this._initMinder( id, option || {} );
        this._initEvents();
        this._initModules( option );
    },

    _initMinder: function ( id, option ) {

        this._rc = new kity.Group();
        this._paper = new kity.Paper( option.renderTo || document.body );
        this._paper.addShape( this._rc );

        this._root = new MinderNode( this );
        this._rc.addShape( this._root.getRenderContainer() );
    },

    getRenderContainer: function () {
        return this._rc;
    },

    getPaper: function () {
        return this._paper;
    }
} );