kity.extendClass( Minder, {
	_getCommand: function ( name ) {
		return this._commands[ name.toLowerCase() ];
	},
	_getQuery: function ( name ) {
		if ( !this._query[ name ] ) {
			var Cmd = this._getCommand( name );
			this._query[ name ] = new Cmd();
		}
		return this._query[ name ];
	},
	_queryCommand: function ( name, type ) {
		var me = this;
		var query = this._getQuery( name );
		var queryFunc = query[ name ][ "state" + type ];
		if ( queryFunc ) {
			return queryFunc( me );
		} else {
			return 0;
		}
	},
	execCommand: function ( name ) {
		var TargetCommand, command, cmdArgs, eventParams, stoped;

		TargetCommand = this._getCommand( name );
		console.log( TargetCommand );
		if ( !TargetCommand ) {
			return false;
		}
		command = new TargetCommand();

		cmdArgs = Array.prototype.slice.call( arguments, 1 );

		eventParams = {
			command: command,
			commandName: name.toLowerCase(),
			commandArgs: cmdArgs
		};

		this._executingCommand = this._executingCommand || command;

		if ( this._executingCommand == command ) {

			stoped = this._fire( new MinderEvent( 'beforecommand', eventParams, true ) );

			if ( !stoped ) {

				this._fire( new MinderEvent( "precommand", eventParams, false ) );

				command.execute.apply( command, [ this ].concat( cmdArgs ) );

				this._fire( new MinderEvent( "command", eventParams, false ) );

				if ( command.isContentChanged() ) {
					this._firePharse( new MinderEvent( 'contentchange' ) );
				}
				if ( command.isSelectionChanged() ) {
					this._firePharse( new MinderEvent( 'selectionchange' ) );
				}
				this._firePharse( new MinderEvent( 'interactchange' ) );
			}

			this._executingCommand = null;
		} else {
			command.execute.apply( command, [ this ].concat( cmdArgs ) );
		}
	},

	queryCommandState: function ( name ) {
		return this._queryCommand( name, "State" );
	},

	queryCommandValue: function ( name ) {
		return this._queryCommand( name, "Value" );
	}
} );