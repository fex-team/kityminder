// 模块声明周期维护
kity.extendClass( Minder, {
    _initModules: function () {
        var modulesPool = KityMinder.getModules();
        var modulesToLoad = this._options.modules || Utils.keys( modulesPool );

        this._commands = {};
        this._query = {};
        this._modules = {};

        var i, name, module, moduleDeals, dealCommands, dealEvents;

        var me = this;
        for ( i = 0; i < modulesToLoad.length; i++ ) {
            name = modulesToLoad[ i ];

            if ( !modulesPool[ name ] ) continue;

            //执行模块初始化，抛出后续处理对象
            moduleDeals = modulesPool[ name ].call( me );
            this._modules[ name ] = moduleDeals;

            if ( moduleDeals.init ) {
                moduleDeals.init.call( me, Utils.extend( moduleDeals.defaultOptions || {}, this._options ) );
            }

            //command加入命令池子
            dealCommands = moduleDeals.commands;
            for ( var name in dealCommands ) {
                this._commands[ name.toLowerCase() ] = new dealCommands[ name ];
            }

            //绑定事件
            dealEvents = moduleDeals.events;
            if ( dealEvents ) {
                for ( var type in dealEvents ) {
                    me.on( type, dealEvents[ type ] );
                }
            }

        }
    },

    _garbage: function () {
        this.clearSelect();

        while ( this._root.getChildren().length ) {
            this._root.removeChild( 0 );
        }
    },

    destroy: function () {
        var modules = this._modules;

        this._resetEvents();
        this._garbage();

        for ( var key in modules ) {
            if ( !modules[ key ].destroy ) continue;
            modules[ key ].destroy.call( this );
        }
    },

    reset: function () {
        var modules = this._modules;

        this._garbage();

        for ( var key in modules ) {
            if ( !modules[ key ].reset ) continue;
            modules[ key ].reset.call( this );
        }
    }
} );