// 模块声明周期维护
kity.extendClass( Minder, {
    _initModules: function () {
        var _modules = KityMinder.getModules();
        if ( _modules ) {
            var me = this;
            for ( var key in _modules ) {
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