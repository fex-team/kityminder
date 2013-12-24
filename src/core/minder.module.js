// 模块声明周期维护
kity.extendClass( Minder, {
    _initModules: function () {
        this._commands = {};
        this._query = {};
        this._modules = {};
        var _modules = KityMinder.getModules();
        var _modulesList = ( function () {
            var _list = [];
            for ( var key in _modules ) {
                _list.push( key );
            }
            return _list;
        } )();
        var _configModules = this._options.modules = this._options.modules || _modulesList;
        console.log( _configModules );
        if ( _modules ) {
            var me = this;
            for ( var i = 0; i < _configModules.length; i++ ) {
                var key = _configModules[ i ];
                if ( !_modules[ key ] ) continue;
                //执行模块初始化，抛出后续处理对象
                var moduleDeals = _modules[ key ].call( me );
                this._modules[ key ] = moduleDeals;
                if ( moduleDeals.initial ) {
                    moduleDeals.initial.call( me );
                }

                //command加入命令池子
                var moduleDealsCommands = moduleDeals.commands;
                if ( moduleDealsCommands ) {
                    for ( var _keyC in moduleDealsCommands ) {
                        this._commands[ _keyC ] = moduleDealsCommands[ _keyC ];
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
        var me = this;
        var _modulesList = this._options.modules;
        var _modules = this._modules;
        //解除事件绑定
        this._resetEvents();
        for ( var key in _modules ) {
            if ( !_modules[ key ].destroy ) continue;
            _modules[ key ].destroy.call( me );
        }
    },

    reset: function () {
        var me = this;
        var _modules = this._modules;
        for ( var key in _modules ) {
            if ( !_modules[ key ].reset ) continue;
            _modules[ key ].reset.call( me );
        }
    }
} );