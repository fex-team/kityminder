//模块注册&暴露模块接口
( function () {
    var _modules;
    KityMinder.registerModule = function ( name, module ) {
        //初始化模块列表
        if ( !_modules ) {
            _modules = {};
        }
        _modules[ name ] = module;
    };
    KityMinder.getModules = function () {
        return _modules;
    };
} )();

Minder.registerInit(function() {
    this._initModules();
});

// 模块声明周期维护
kity.extendClass(Minder, {
    _initModules: function() {
        var modulesPool = KityMinder.getModules();
        var modulesToLoad = this._options.modules || Utils.keys(modulesPool);

        this._commands = {};
        this._query = {};
        this._modules = {};
        this._rendererClasses = {};

        var i, name, type, module, moduleDeals,
            dealCommands, dealEvents, dealRenderers;

        var me = this;
        for (i = 0; i < modulesToLoad.length; i++) {
            name = modulesToLoad[i];

            if (!modulesPool[name]) continue;

            // 执行模块初始化，抛出后续处理对象

            if (typeof(modulesPool[name]) == 'function') {
                moduleDeals = modulesPool[name].call(me);
            } else {
                moduleDeals = modulesPool[name];
            }
            this._modules[name] = moduleDeals;

            if (moduleDeals.init) {
                moduleDeals.init.call(me, this._options);
            }

            // command加入命令池子
            dealCommands = moduleDeals.commands;
            for (name in dealCommands) {
                this._commands[name.toLowerCase()] = new dealCommands[name]();
            }

            // 绑定事件
            dealEvents = moduleDeals.events;
            if (dealEvents) {
                for (type in dealEvents) {
                    me.on(type, dealEvents[type]);
                }
            }

            // 渲染器
            dealRenderers = moduleDeals.renderers;

            if (dealRenderers) {

                for (type in dealRenderers) {
                    this._rendererClasses[type] = this._rendererClasses[type] || [];

                    if (Utils.isArray(dealRenderers[type])) {
                        this._rendererClasses[type] = this._rendererClasses[type].concat(dealRenderers[type]);
                    } else {
                        this._rendererClasses[type].push(dealRenderers[type]);
                    }
                }
            }

            if (moduleDeals.defaultOptions) {
                this.setDefaultOptions(moduleDeals.defaultOptions);
            }

            //添加模块的快捷键
            if (moduleDeals.commandShortcutKeys) {
                this.addCommandShortcutKeys(moduleDeals.commandShortcutKeys);
            }

            //添加邮件菜单
            if (moduleDeals.contextmenu) {
                this.addContextMenu(moduleDeals.contextmenu);
            }
        }
    },

    _garbage: function() {
        this.clearSelect();

        while (this._root.getChildren().length) {
            this._root.removeChild(0);
        }
    },

    destroy: function() {
        var modules = this._modules;

        this._resetEvents();
        this._garbage();

        for (var key in modules) {
            if (!modules[key].destroy) continue;
            modules[key].destroy.call(this);
        }
    },

    reset: function() {
        var modules = this._modules;

        this._garbage();

        for (var key in modules) {
            if (!modules[key].reset) continue;
            modules[key].reset.call(this);
        }
    }
});