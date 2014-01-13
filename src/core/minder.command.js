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
	_initCommandStack: function () {
		this._commandStack = [];
	},

	_pushCommandStack: function ( command ) {
		this._commandStack.push( command );
	},

	_popCommandStack: function () {
		this._commandStack.pop();
	},

	getCommandStack: function () {
		// 返回副本防止被修改
		return this._commandStack.slice( 0 );
	},

	getExecutingCommand: function () {
		return this._commandStack[ this._commandStack.length - 1 ];
	},

	getTopExecutingCommand: function () {
		return this._commandStack[ 0 ];
	},

	isTopCommandExecuting: function () {
		return this._commandStack.length == 1;
	},

	queryCommandState: function ( name ) {
		return this._queryCommand( name, "State" );
	},

	queryCommandValue: function ( name ) {
		return this._queryCommand( name, "Value" );
	},

	execCommand: function ( name ) {
		var TargetCommand, command, cmdArgs, eventParams, stoped, isTopCommand, result;
		var me = this;

		TargetCommand = this._getCommand( name );
		if ( !TargetCommand ) {
			return false;
		}

		command = new TargetCommand();

		this._pushCommandStack( command );

		cmdArgs = Array.prototype.slice.call( arguments, 1 );

		eventParams = {
			command: command,
			commandName: name.toLowerCase(),
			commandArgs: cmdArgs
		};

		stoped = this._fire( new MinderEvent( 'beforecommand', eventParams, true ) );

		if ( !stoped ) {

			this._fire( new MinderEvent( "precommand", eventParams, false ) );

			result = command.execute.apply( command, [ me ].concat( cmdArgs ) );

			this._fire( new MinderEvent( "command", eventParams, false ) );

		}

		// 顶级命令才触发事件
		if ( !stoped && this.isTopCommandExecuting() ) {
			this._popCommandStack();
			if ( command.isContentChanged() ) {
				this._firePharse( new MinderEvent( 'contentchange' ) );
			}
			if ( command.isSelectionChanged() ) {
				this._firePharse( new MinderEvent( 'selectionchange' ) );
			}
			this._firePharse( new MinderEvent( 'interactchange' ) );
		} else {
			this._popCommandStack();
		}

		return result || null;
	}
} );