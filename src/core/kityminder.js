var KityMinder = kity.createClass("KityMinder", {
    constructor: function (id, option) {
        // 初始化
        this._initModules();
        this._initEvents();
    }
});

KityMinder.version = '1.0.0.0';
KityMinder.debug = true;

// 模块注册
KityMinder.registerModule = function( name, module ) {
    //初始化模块列表
    this._modules = this._modules||{};
    this._modules[name] = module;
};

// 模块维护
kity.extendClass(KityMinder, {
    _initModules: function() {
        var me = this;
        //在对象上挂接command池子
        me.commands = {};
        var _modules = KityMinder._modules;
        if(_modules){
            for(var key in _modules){
                //执行模块初始化，抛出后续处理对象
                var moduleDeals = 
                    _modules[key].call(me);
                console.log(moduleDeals);

                moduleDeals["ready"]&&moduleDeals["ready"].call(this);

                //command加入命令池子
                var moduleDealsCommands = moduleDeals["commands"];
                if(moduleDealsCommands){
                    for(var _key in moduleDealsCommands){
                        me.commands[_key] = moduleDealsCommands[_key];
                    }
                }
                
                //绑定事件
                var moduleDealsEvents = moduleDeals["events"];
                if(moduleDealsEvents){
                    for(var _key in moduleDealsEvents){
                        var bindEvs = _key.split(" ");
                        console.log(bindEvs);
                        var func = moduleDealsEvents[_key];
                        for (var _i = 0; _i < bindEvs.length; _i++){
                            me.on(bindEvs[_i],func);
                        }
                    }
                }

            }
        }
    }
});

// 节点控制
kity.extendClass(KityMinder, {
    getRoot: function() {

    },

    update: function( node ) {

    }
});

// 事件机制
kity.extendClass(KityMinder, {
    _initEvents: function() {

    },
    on: function( name, callback ) {

    },
    once: function( name, callback ) {

    },
    off: function( name, callback ) {

    },
    fire: function( name, params ) {

    }
});

// 命令机制
kity.extendClass(KityMinder, {
    execCommand: function( name ) {

    },

    queryCommandState: function( name ) {

    },

    queryCommandValue: function( name ) {

    }
});

// 导入导出
kity.extendClass(KityMinder, {
    export: function() {

    },

    import: function() {

    }
});

// 选区管理
kity.extendClass(KityMinder, {
    getSelectedNodes: function() {

    },

    select: function( nodes ) {

    },

    selectSingle: function( node ) {

    },

    toggleSelect: function( nodes ) {

    },

    clearSelect: function( nodes ) {

    }
});