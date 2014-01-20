KityMinder.registerModule( "HistoryModule", function () {

    var Scene = kity.createClass('Scene',{
        constructor:function(root){

        },
        equals:function(scene){

        }
    })
    var UndoManager = kity.createClass('UndoManager',{
        constructor : function(){
            this.list = [];
        }
    })

    var UndoCommand = kity.createClass( "UndoCommand", {
        base: Command,

        execute: function ( km ) {
            var undoStack = getStack( km, "undo" ),
                redoStack = getStack( km, "redo" ),
                contextStack, context;

            if ( !undoStack.empty() ) {
                contextStack = undoStack.pop();
                redoStack.push( contextStack );

                for ( var i = contextStack.length - 1; i >= 0; i-- ) {
                    context = contextStack[ i ];
                    context.command.revert( km );
                }
            }
        },

        queryState: function ( km ) {
            return getStack( km, 'undo' ).empty() ? -1 : 0;
        }
    } );

    var RedoCommand = kity.createClass( "RedoCommand", {
        base: Command,

        execute: function ( km ) {
            var undoStack = getStack( km, "undo" ),
                redoStack = getStack( km, "redo" ),
                contextStack, context;

            if ( !redoStack.empty() ) {
                contextStack = redoStack.pop();
                undoStack.push( contextStack );

                markRedoing( km, true );
                for ( var i = 0; i < contextStack.length; i++ ) {
                    context = contextStack[ i ];
                    context.command.execute.apply( context.command, [ km ].concat( context.args ) );
                }
                markRedoing( km, false );
            }
        },

        queryState: function ( km ) {
            return getStack( km, 'redo' ).empty() ? -1 : 0;
        }
    } );

    return {
        "commands": {
            "undo": UndoCommand,
            "redo": RedoCommand
        },

        "events": {
            "saveScene": function ( e ) {

            }
        }
    };
} );