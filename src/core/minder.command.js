kity.extendClass( Minder, {
    _getCommand: function ( name ) {
        return this._commands[ name.toLowerCase() ];
    },

    _queryCommand: function ( name, type, args ) {
        var cmd = this._getCommand( name );
        if ( cmd ) {
            var queryCmd = cmd[ 'query' + type ];
            if ( queryCmd )
                return queryCmd.apply( cmd, [ this ].concat( args ) );
        }
        return 0;
    },

    queryCommandState: function ( name ) {
        return this._queryCommand( name, "State", Utils.argsToArray( 1 ) );
    },

    queryCommandValue: function ( name ) {
        return this._queryCommand( name, "Value", Utils.argsToArray( 1 ) );
    },

    execCommand: function ( name ) {
        name = name.toLowerCase();

        var cmdArgs = Utils.argsToArray( arguments, 1 ),
            cmd, stoped, result, eventParams;
        var me = this;
        cmd = this._getCommand( name );

        eventParams = {
            command: cmd,
            commandName: name.toLowerCase(),
            commandArgs: cmdArgs
        };
        if ( !cmd ) {
            return false;
        }

        if ( !this._hasEnterExecCommand && cmd.isNeedUndo() ) {
            this._hasEnterExecCommand = true;
            stoped = this._fire( new MinderEvent( 'beforeExecCommand', eventParams, true ) );

            if ( !stoped ) {
                //保存场景
                this._fire( new MinderEvent( 'saveScene' ) );

                this._fire( new MinderEvent( "preExecCommand", eventParams, false ) );

                result = cmd.execute.apply( cmd, [ me ].concat( cmdArgs ) );

                this._fire( new MinderEvent( 'execCommand', eventParams, false ) );

                //保存场景
                this._fire( new MinderEvent( 'saveScene' ) );

                if ( cmd.isContentChanged() ) {
                    this._firePharse( new MinderEvent( 'contentchange' ) );
                }
                if ( cmd.isSelectionChanged() ) {
                    this._firePharse( new MinderEvent( 'selectionchange' ) );
                }
                this._firePharse( new MinderEvent( 'interactchange' ) );
            }
            this._hasEnterExecCommand = false;
        } else {
            result = cmd.execute.apply( cmd, [ me ].concat( cmdArgs ) );

            if(!this._hasEnterExecCommand){
                if ( cmd.isSelectionChanged() ) {
                    this._firePharse( new MinderEvent( 'selectionchange' ) );
                }

                this._firePharse( new MinderEvent( 'interactchange' ) );
            }
        }

        return result === undefined ? null : result;
    }
} );