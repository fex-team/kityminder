kity.extendClass( Minder, {
	execCommand: function ( name ) {
		var me = this;
		var _action = new _commands[ name.toLowerCase() ]();

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