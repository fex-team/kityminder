var Command = kity.createClass( "Command", {
	constructor: function () {
		this._isContentChange = true;
		this._isSelectionChange = false;
	},

	execute: function ( minder, args ) {

	},

	setContentChanged: function ( val ) {
		this._isContentChange = !! val;
	},

	isContentChanged: function () {
		return this._isContentChange;
	},

	setSelectionChanged: function ( val ) {
		this._isSelectionChange = !! val;
	},

	isSelectionChanged: function () {
		return this._isContentChange;
	},

	queryState: function ( km ) {
		return 0;
	},

	queryValue: function ( km ) {
		return 0;
	},
	isNeedUndo: function () {
		return true;
	}
} );

kity.extendClass(Minder, {
    _getCommand: function (name) {
        return this._commands[name.toLowerCase()];
    },

    _queryCommand: function (name, type, args) {
        var cmd = this._getCommand(name);
        if (cmd) {
            var queryCmd = cmd['query' + type];
            if (queryCmd)
                return queryCmd.apply(cmd, [this].concat(args));
        }
        return 0;
    },

    queryCommandState: function (name) {
        return this._queryCommand(name, "State", Utils.argsToArray(1));
    },

    queryCommandValue: function (name) {
        return this._queryCommand(name, "Value", Utils.argsToArray(1));
    },

    execCommand: function (name) {
        name = name.toLowerCase();

        var cmdArgs = Utils.argsToArray(arguments, 1),
            cmd, stoped, result, eventParams;
        var me = this;
        cmd = this._getCommand(name);

        eventParams = {
            command: cmd,
            commandName: name.toLowerCase(),
            commandArgs: cmdArgs
        };
        if (!cmd || !~this.queryCommandState(name)) {
            return false;
        }

        if (!this._hasEnterExecCommand && cmd.isNeedUndo()) {
            this._hasEnterExecCommand = true;
            stoped = this._fire(new MinderEvent('beforeExecCommand', eventParams, true));

            if (!stoped) {
                //保存场景
                this._fire(new MinderEvent('saveScene'));

                this._fire(new MinderEvent("preExecCommand", eventParams, false));

                result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

                this._fire(new MinderEvent('execCommand', eventParams, false));

                //保存场景
                this._fire(new MinderEvent('saveScene'));

                if (cmd.isContentChanged()) {
                    this._firePharse(new MinderEvent('contentchange'));
                }

                this._interactChange();
            }
            this._hasEnterExecCommand = false;
        } else {
            result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

            if (!this._hasEnterExecCommand) {
                this._interactChange();
            }
        }

        return result === undefined ? null : result;
    }
});