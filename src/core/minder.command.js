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
		var me = this;
		var Action = this._getCommand( name );
		var _action;
		if ( !Action ) {
			return false;
		} else {
			_action = new Action();
		}

		var cmdArgs = Array.prototype.slice.call( arguments, 1 );

		var eventParams = {
			command: _action,
			commandName: name.toLowerCase(),
			commandArgs: cmdArgs
		};

		var stoped = me._fire( new MinderEvent( 'beforecommand', eventParams, true ) );

		if ( !stoped ) {

			me._fire( new MinderEvent( "precommand", eventParams, false ) );

			_action.execute.apply( _action, [ this ].concat( cmdArgs ) );

			me._fire( new MinderEvent( "command", eventParams, false ) );

			if ( _action.isContentChanged() ) {
				me._firePharse( new MinderEvent( 'contentchange' ) );
			}
			if ( _action.isSelectionChanged() ) {
				me._firePharse( new MinderEvent( 'selectionchange' ) );
			}
			me._firePharse( new MinderEvent( 'interactchange' ) );
		}
	},

	queryCommandState: function ( name ) {
		return this._queryCommand( name, "State" );
	},

	queryCommandValue: function ( name ) {
		return this._queryCommand( name, "Value" );
	}
} );