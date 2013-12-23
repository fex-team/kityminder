var Command = kity.createClass( "Command", {
    constructor: function () {
        this._isContentChange = true;
        this._isSelectionChange = false;
    },

    execute: function ( minder, args ) {

    },

    revert: function () {

    },

    setContentChanged: function ( val ) {
        this._isContentChange = typeof ( val ) === "boolean" ? val : this._isContentChange;
    },

    isContentChanged: function () {
        return this._isContentChange;
    },

    setSelectionChanged: function ( val ) {
        this._isSelectionChange = typeof ( val ) === "boolean" ? val : this._isContentChange;
    },

    isSelectionChanged: function () {
        return this._isContentChange;
    },

    queryState: function ( km ) {
        return 0;
    },

    queryValue: function ( km ) {
        return 0;
    }
} );