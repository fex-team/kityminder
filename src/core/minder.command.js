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
		var query = this._getQuery( name );
		var queryFunc = query[ name ][ "query" + type ];
		if ( queryFunc ) {
			return queryFunc.call( query, this );
		} else {
			return 0;
		}
	},
	execCommand: function ( name ) {
		var TargetCommand, command, cmdArgs, eventParams, stoped, isTopCommand, result;

		TargetCommand = this._getCommand( name );
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

		if ( !this._executingCommand ) {
			this._executingCommand = command;
			isTopCommand = true;
		} else {
			isTopCommand = false;
		}

		stoped = this._fire( new MinderEvent( 'beforecommand', eventParams, true ) );

		if ( !stoped ) {

			this._fire( new MinderEvent( "precommand", eventParams, false ) );
			result = command.execute.apply( command, [ this ].concat( cmdArgs ) );
			this._fire( new MinderEvent( "command", eventParams, false ) );

			// 顶级命令才触发事件
			if ( isTopCommand ) {
				if ( command.isContentChanged() ) {
					this._firePharse( new MinderEvent( 'contentchange' ) );
				}
				if ( command.isSelectionChanged() ) {
					this._firePharse( new MinderEvent( 'selectionchange' ) );
				}
				this._firePharse( new MinderEvent( 'interactchange' ) );
			}
		}

		// 顶级事件执行完毕才能清楚顶级事件的执行标记
		if ( isTopCommand ) {
			this._executingCommand = null;
		}

		return result || null;
	},

	queryCommandState: function ( name ) {
		return this._queryCommand( name, "State" );
	},

	queryCommandValue: function ( name ) {
		return this._queryCommand( name, "Value" );
	}
} );