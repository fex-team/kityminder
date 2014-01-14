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