KityMinder.registerModule( "TextEditModule", function () {
    var EditTextCommand = kity.createClass( 'EditTextCommand', {
        base: Command,
        execute: function ( km, node ) {
            node.setData( 'text', prompt( 'input the text:' ) );
            km.execCommand( 'rendernode', node );
        }
    } );
    return {
        "commands": {
            'edittext': EditTextCommand
        },

        "events": {

        }
    };
} );