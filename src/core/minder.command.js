kity.extendClass( Minder, {
	execCommand: function ( name ) {
		var TargetCommand, command, cmdArgs, eventParams, stoped;

		TargetCommand = this._getCommand( name );
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
			}

			this._executingCommand = null;
		} else {
			command.execute.apply( command, [ this ].concat( cmdArgs ) );
		}
	},

	queryCommandState: function ( name ) {
		if ( !_commands[ name.toLowerCase() ] ) {
			return false;
		}
		if ( !_query[ name ] ) {
			_query[ name ] = new _commands[ name ]();
		}
		if ( _query[ name ].queryState ) {
			return _query[ name ].queryState( this );
		} else {
			return 0;
		}
	},

	queryCommandValue: function ( name ) {
		if ( !_commands[ name.toLowerCase() ] ) {
			return false;
		}
		if ( !_query[ name ] ) {
			_query[ name ] = new _commands[ name ]();
		}
		if ( _query[ name ].queryValue ) {
			return _query[ name ].queryValue( this );
		} else {
			return 0;
		}

	}
} );