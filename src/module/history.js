KityMinder.registerModule( "HistoryModule", function () {

    var Stack = kity.createClass( "Stack", {
        constructor: function ( size ) {
            this.size = size || Number.MAX_VALUE;
            this.length = 0;
        },
        push: function ( elem ) {
            if ( this.length === this.size ) {
                this.shift();
            }
            this[ this.length++ ] = elem;
        },
        top: function () {
            return this[ this.length - 1 ];
        },
        pop: function () {
            return this[ --this.length ];
        },
        empty: function () {
            return this.length === 0;
        },
        clear: function () {
            this.length = 0;
        },
        splice: function () {
            // just to make stack array-like
        }
    } );

    function getStack( km, type ) {
        var stacks = km._hisoryStacks || ( km._hisoryStacks = {} );
        return stacks[ type ] || ( stacks[ type ] = new Stack() );
    }

    function markExecuting( km, command ) {
        km._commandExecuting = command;
    }

    function getExecuting( km ) {
        return km._commandExecuting || null;
    }

    function markRedoing( km, redoing ) {
        km._redoing = redoing;
    }

    function isRedoing( km ) {
        return km._redoing;
    }

    function shouldIgnore( cmdName ) {
        return cmdName == 'undo' || cmdName == 'redo';
    }

    function getCommandContext( e ) {
        return {
            name: e.commandName,
            args: e.commandArgs,
            command: e.command
        };
    }

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
            "beforecommand": function ( e ) {
                if ( isRedoing( this ) ) {
                    e.stopPropagation();
                }
            },

            "precommand": function ( e ) {
                if ( shouldIgnore( e.commandName ) ) return;

                var undoStack = getStack( this, "undo" ),
                    redoStack = getStack( this, "redo" ),
                    contextStack;

                if ( getExecuting( this ) === null ) {
                    markExecuting( this, e.command );
                    undoStack.push( new Stack() );
                    redoStack.clear();
                }

                contextStack = undoStack.top();
                contextStack.push( getCommandContext( e ) );
            },

            "command": function ( e ) {
                if ( shouldIgnore( e.commandName ) ) return;

                if ( getExecuting( this ) === e.command ) {
                    markExecuting( this, null );
                }
            }
        }
    };
} );