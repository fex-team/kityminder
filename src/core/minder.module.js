// 模块声明周期维护
kity.extendClass( Minder, {
    _initModules: function () {
        this._commands = {};
        this._query = {};
        var _modules = Minder.getModules();
        var _modulesList = ( function () {
            var _list = [];
            for ( var key in _modules ) {
                _list.push( key );
            }
        } )();
        var _configModules = this.option.modules || _modulesList;
        var _commands = this._commands;
        if ( _modules ) {
            var me = this;
            for ( var i = 0; i < _configModules.length; i++ ) {
                var key = _configModules[ i ];
                //执行模块初始化，抛出后续处理对象
                var moduleDeals = _modules[ key ].call( me );

                if ( moduleDeals.initial ) {
                    moduleDeals.initial.call( me );
                }

                //command加入命令池子
                var moduleDealsCommands = moduleDeals.commands;
                if ( moduleDealsCommands ) {
                    for ( var _keyC in moduleDealsCommands ) {
                        _commands[ _keyC ] = moduleDealsCommands[ _keyC ];
                    }
                }

                //绑定事件
                var moduleDealsEvents = moduleDeals.events;
                if ( moduleDealsEvents ) {
                    for ( var _keyE in moduleDealsEvents ) {
                        me.on( _keyE, moduleDealsEvents[ _keyE ] );
                    }
                }

            }
        }
    },

    destroy: function () {

    },

    reset: function () {

    }
} );