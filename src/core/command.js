var Command = kity.createClass( "Command", ( function () {
    var _isContentChange = true;
    var _isSelectionChange = false;
    return {

        constructor: function () {

        },

        execute: function ( minder, args ) {

        },

        revert: function () {

        },

        setContentChanged: function ( val ) {
            _isContentChange = typeof ( val ) === "boolean" ? val : _isContentChange;
        },

        isContentChanged: function () {
            return _isContentChange;
        },

        setSelectionChanged: function ( val ) {
            _isSelectionChange = typeof ( val ) === "boolean" ? val : _isSelectionChange;
        },

        isSelectionChanged: function () {
            return _isSelectionChange;
        },

        queryState: function ( km ) {
            return 0;
        },

        queryValue: function ( km ) {
            return 0;
        }
    };
} )() );